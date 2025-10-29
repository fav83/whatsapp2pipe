using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;

namespace WhatsApp2Pipe.Api.Middleware;

public class CorsMiddleware : IFunctionsWorkerMiddleware
{
    private static readonly string[] FunctionsToSkip = { "AuthCallback" };

    private const string AllowedOrigin = "https://web.whatsapp.com";
    private const string AllowedMethods = "GET, POST";
    private const string AllowedHeaders = "*";

    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        // Execute the function
        await next(context);

        // Get the function name
        var functionName = context.FunctionDefinition.Name;

        // Skip CORS for specific functions (like AuthCallback which does redirects)
        if (Array.Exists(FunctionsToSkip, fn => fn.Equals(functionName, StringComparison.OrdinalIgnoreCase)))
        {
            return;
        }

        // Try to get the HTTP response data
        var httpResponseData = context.GetHttpResponseData();

        if (httpResponseData != null)
        {
            // Add CORS headers to the response
            httpResponseData.Headers.Add("Access-Control-Allow-Origin", AllowedOrigin);
            httpResponseData.Headers.Add("Access-Control-Allow-Methods", AllowedMethods);
            httpResponseData.Headers.Add("Access-Control-Allow-Headers", AllowedHeaders);
        }
    }
}
