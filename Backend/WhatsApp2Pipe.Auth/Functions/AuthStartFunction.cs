using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Auth.Models;
using WhatsApp2Pipe.Auth.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Auth.Functions;

public class AuthStartFunction
{
    private readonly ITableStorageService tableStorageService;
    private readonly IOAuthService oauthService;
    private readonly ILogger<AuthStartFunction> logger;

    public AuthStartFunction(
        ITableStorageService tableStorageService,
        IOAuthService oauthService,
        ILogger<AuthStartFunction> logger)
    {
        this.tableStorageService = tableStorageService;
        this.oauthService = oauthService;
        this.logger = logger;
    }

    [Function("AuthStart")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/start")] HttpRequestData req)
    {
        logger.LogInformation("AuthStart endpoint called");

        try
        {
            // Generate CSRF state parameter
            var state = await tableStorageService.CreateStateAsync();

            // Build Pipedrive authorization URL
            var authorizationUrl = oauthService.BuildAuthorizationUrl(state);

            // Return authorization URL to client
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            var responseBody = new AuthStartResponse
            {
                AuthorizationUrl = authorizationUrl
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(responseBody));

            logger.LogInformation("AuthStart completed successfully, state: {State}", state);

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in AuthStart endpoint");

            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.Headers.Add("Content-Type", "application/json");

            var errorBody = new ErrorResponse
            {
                Error = "internal_error",
                ErrorDescription = "An internal error occurred while starting the authorization flow"
            };

            await errorResponse.WriteStringAsync(JsonSerializer.Serialize(errorBody));

            return errorResponse;
        }
    }
}
