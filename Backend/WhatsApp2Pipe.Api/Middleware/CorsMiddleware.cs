using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.Configuration;

namespace WhatsApp2Pipe.Api.Middleware;

public class CorsMiddleware : IFunctionsWorkerMiddleware
{
    private static readonly string[] FunctionsToSkip = { "AuthCallback" };
    private const string AllowedMethods = "GET, POST, OPTIONS";
    private const string AllowedHeaders = "Content-Type, Authorization";

    private readonly IConfiguration configuration;

    public CorsMiddleware(IConfiguration configuration)
    {
        this.configuration = configuration;
    }

    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        // Get the function name
        var functionName = context.FunctionDefinition.Name;

        // Skip CORS for specific functions that only return redirects (AuthCallback)
        // AuthStart is NOT skipped because it returns JSON for extension clients
        if (Array.Exists(FunctionsToSkip, fn => fn.Equals(functionName, StringComparison.OrdinalIgnoreCase)))
        {
            await next(context);
            return;
        }

        // Get the HTTP request
        var httpRequestData = await context.GetHttpRequestDataAsync();

        if (httpRequestData != null)
        {
            // Get allowed origins from configuration
            var allowedOriginsConfig = configuration["CORS_ALLOWED_ORIGINS"] ?? string.Empty;
            var allowedOrigins = allowedOriginsConfig
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToArray();

            // Get the origin header from the request
            var origin = httpRequestData.Headers.TryGetValues("Origin", out var originValues)
                ? originValues.FirstOrDefault()
                : null;

            var isOptionsRequest = httpRequestData.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase);
            var isOriginAllowed = !string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin);

            // Execute the function (may fail for OPTIONS if function doesn't handle it)
            await next(context);

            // Get the response
            var httpResponseData = context.GetHttpResponseData();

            // For OPTIONS requests, replace response with proper CORS response
            if (isOptionsRequest && isOriginAllowed && httpRequestData != null)
            {
                var optionsResponse = httpRequestData.CreateResponse(System.Net.HttpStatusCode.OK);
                optionsResponse.Headers.Add("Access-Control-Allow-Origin", origin);
                optionsResponse.Headers.Add("Access-Control-Allow-Methods", AllowedMethods);
                optionsResponse.Headers.Add("Access-Control-Allow-Headers", AllowedHeaders);

                // Replace the response
                var invocationResult = context.GetInvocationResult();
                invocationResult.Value = optionsResponse;
            }
            // For non-OPTIONS requests, add CORS headers to existing response
            else if (httpResponseData != null && isOriginAllowed)
            {
                // Remove existing CORS headers if any
                httpResponseData.Headers.Remove("Access-Control-Allow-Origin");
                httpResponseData.Headers.Remove("Access-Control-Allow-Methods");
                httpResponseData.Headers.Remove("Access-Control-Allow-Headers");

                // Add CORS headers
                httpResponseData.Headers.Add("Access-Control-Allow-Origin", origin);
                httpResponseData.Headers.Add("Access-Control-Allow-Methods", AllowedMethods);
                httpResponseData.Headers.Add("Access-Control-Allow-Headers", AllowedHeaders);
            }
        }
        else
        {
            // No HTTP request data, just execute the function
            await next(context);
        }
    }
}
