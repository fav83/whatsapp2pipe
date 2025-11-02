using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;

namespace WhatsApp2Pipe.Api.Middleware;

public class CorsMiddleware : IFunctionsWorkerMiddleware
{
    private static readonly string[] FunctionsToSkip = { "AuthCallback", "AuthStart" };

    private static readonly string[] AllowedOrigins = {
        "https://web.whatsapp.com",          // Chrome extension
        "http://localhost:3001",              // Website (development)
        "http://localhost:5173",              // Website (development - Vite default)
        "https://dashboard.chat2deal.com"     // Website (production)
    };

    private const string AllowedMethods = "GET, POST, OPTIONS";
    private const string AllowedHeaders = "Content-Type, Authorization";

    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        // Execute the function first
        await next(context);

        // Get the function name
        var functionName = context.FunctionDefinition.Name;

        // Skip CORS for specific functions (like AuthCallback/AuthStart which do redirects)
        if (Array.Exists(FunctionsToSkip, fn => fn.Equals(functionName, StringComparison.OrdinalIgnoreCase)))
        {
            return;
        }

        // Get the HTTP request and response
        var httpRequestData = await context.GetHttpRequestDataAsync();
        var httpResponseData = context.GetHttpResponseData();

        if (httpRequestData != null && httpResponseData != null)
        {
            // Get the origin header from the request
            var origin = httpRequestData.Headers.TryGetValues("Origin", out var originValues)
                ? originValues.FirstOrDefault()
                : null;

            // Add CORS headers to the response if origin is allowed
            if (!string.IsNullOrEmpty(origin) && AllowedOrigins.Contains(origin))
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
