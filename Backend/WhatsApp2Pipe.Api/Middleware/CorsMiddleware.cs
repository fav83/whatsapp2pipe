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
        // Execute the function first
        await next(context);

        // Get the function name
        var functionName = context.FunctionDefinition.Name;

        // Skip CORS for specific functions that only return redirects (AuthCallback)
        // AuthStart is NOT skipped because it returns JSON for extension clients
        if (Array.Exists(FunctionsToSkip, fn => fn.Equals(functionName, StringComparison.OrdinalIgnoreCase)))
        {
            return;
        }

        // Get the HTTP request and response
        var httpRequestData = await context.GetHttpRequestDataAsync();
        var httpResponseData = context.GetHttpResponseData();

        if (httpRequestData != null && httpResponseData != null)
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

            // Add CORS headers to the response if origin is allowed
            if (!string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin))
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
    }
}
