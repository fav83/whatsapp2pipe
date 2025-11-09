using System.Net;
using System.Reflection;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class StatusFunction
{
    private readonly ILogger<StatusFunction> logger;
    private readonly HttpRequestLogger httpRequestLogger;

    public StatusFunction(
        ILogger<StatusFunction> logger,
        HttpRequestLogger httpRequestLogger)
    {
        this.logger = logger;
        this.httpRequestLogger = httpRequestLogger;
    }

    [Function("Status")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "status")]
        HttpRequestData req)
    {
        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("Status request received");

        try
        {
            // Get assembly version
            var assembly = Assembly.GetExecutingAssembly();
            var version = assembly.GetName().Version?.ToString() ?? "0.0.0.0";

            // Create response
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            var responseBody = new
            {
                version = version
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(responseBody));
            httpRequestLogger.LogResponse("Status", (int)HttpStatusCode.OK, responseBody);

            logger.LogInformation("Status returned: {Version}", version);

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to process status request");

            // Even on error, return 200 as requested
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            var responseBody = new
            {
                version = "0.0.0.0"
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(responseBody));
            httpRequestLogger.LogResponse("Status", (int)HttpStatusCode.OK, responseBody);

            return response;
        }
    }
}
