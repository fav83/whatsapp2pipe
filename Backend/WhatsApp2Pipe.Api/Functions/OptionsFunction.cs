using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace WhatsApp2Pipe.Api.Functions;

/// <summary>
/// Handles OPTIONS preflight requests for CORS.
/// </summary>
public class OptionsFunction
{
    private readonly ILogger<OptionsFunction> logger;

    public OptionsFunction(ILogger<OptionsFunction> logger)
    {
        this.logger = logger;
    }

    [Function("Options")]
    public HttpResponseData Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "options", Route = "{*path}")] HttpRequestData req)
    {
        logger.LogInformation("OPTIONS preflight request received for path: {Path}", req.Url.AbsolutePath);

        // Create OK response
        var response = req.CreateResponse(HttpStatusCode.OK);

        // CORS headers will be added by CorsMiddleware
        return response;
    }
}
