using System.Net;
using System.Reflection;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace WhatsApp2Pipe.Api.Functions;

public class StatusFunction
{
    private readonly ILogger<StatusFunction> logger;

    public StatusFunction(ILogger<StatusFunction> logger)
    {
        this.logger = logger;
    }

    [Function("Status")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "status")]
        HttpRequestData req)
    {
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

            return response;
        }
    }
}
