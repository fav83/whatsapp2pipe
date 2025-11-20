using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Api.Functions;

public class MarkDealWonLostFunction
{
    private readonly ILogger<MarkDealWonLostFunction> logger;
    private readonly ISessionService sessionService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly DealTransformService dealTransformService;
    private readonly HttpRequestLogger httpRequestLogger;

    // Cached JSON serializer options for camelCase output
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    // Cached JSON serializer options for input parsing
    private static readonly JsonSerializerOptions JsonInputOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public MarkDealWonLostFunction(
        ILogger<MarkDealWonLostFunction> logger,
        ISessionService sessionService,
        IPipedriveApiClient pipedriveApiClient,
        DealTransformService dealTransformService,
        HttpRequestLogger httpRequestLogger)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.dealTransformService = dealTransformService;
        this.httpRequestLogger = httpRequestLogger;
    }

    [Function("MarkDealWonLost")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "pipedrive/deals/{dealId}/status")]
        HttpRequestData req,
        int dealId)
    {
        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("[MarkDealWonLost] Function triggered - DealId: {DealId}", dealId);

        try
        {
            // 1. Extract and validate Authorization header
            logger.LogInformation("[MarkDealWonLost] Step 1: Checking Authorization header");
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("[MarkDealWonLost] FAILED Step 1: Missing Authorization header");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Authorization header required");
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("[MarkDealWonLost] FAILED Step 1: Invalid Authorization header format");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid Authorization header format");
            }

            var verificationCode = authHeader.Substring("Bearer ".Length).Trim();
            logger.LogInformation("[MarkDealWonLost] Step 1 PASSED: Verification code extracted");

            // 2. Validate session
            logger.LogInformation("[MarkDealWonLost] Step 2: Retrieving session");
            var session = await sessionService.GetSessionAsync(verificationCode);

            if (session == null || session.SessionExpiresAt < DateTime.UtcNow)
            {
                logger.LogWarning("[MarkDealWonLost] FAILED Step 2: Invalid or expired session");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid or expired session");
            }

            logger.LogInformation("[MarkDealWonLost] Step 2 PASSED: Valid session - User: {UserId}, Company: {CompanyId}",
                session.UserId, session.CompanyId);

            // 3. Parse request body
            logger.LogInformation("[MarkDealWonLost] Step 3: Parsing request body");
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                logger.LogWarning("[MarkDealWonLost] FAILED Step 3: Empty request body");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Request body is required");
            }

            MarkDealWonLostRequest? markRequest;
            try
            {
                markRequest = JsonSerializer.Deserialize<MarkDealWonLostRequest>(requestBody, JsonInputOptions);
            }
            catch (JsonException ex)
            {
                logger.LogWarning(ex, "[MarkDealWonLost] FAILED Step 3: Malformed JSON in request body");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid request body");
            }

            if (markRequest == null)
            {
                logger.LogWarning("[MarkDealWonLost] FAILED Step 3: Invalid request body");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid request body");
            }

            logger.LogInformation("[MarkDealWonLost] Step 3 PASSED: Request parsed - Status: {Status}, LostReason: {LostReason}",
                markRequest.Status, markRequest.LostReason ?? "N/A");

            // 4. Validate required fields
            logger.LogInformation("[MarkDealWonLost] Step 4: Validating required fields");
            if (string.IsNullOrWhiteSpace(markRequest.Status))
            {
                logger.LogWarning("[MarkDealWonLost] FAILED Step 4: Missing status");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Status is required");
            }

            if (markRequest.Status != "won" && markRequest.Status != "lost")
            {
                logger.LogWarning("[MarkDealWonLost] FAILED Step 4: Invalid status value: {Status}", markRequest.Status);
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Status must be 'won' or 'lost'");
            }

            if (markRequest.Status == "lost")
            {
                // Lost reason is optional, but if provided, it must not exceed 150 characters
                if (!string.IsNullOrWhiteSpace(markRequest.LostReason) && markRequest.LostReason.Length > 150)
                {
                    logger.LogWarning("[MarkDealWonLost] FAILED Step 4: Lost reason too long: {Length}", markRequest.LostReason.Length);
                    return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Lost reason must be 150 characters or less");
                }
            }

            logger.LogInformation("[MarkDealWonLost] Step 4 PASSED: All required fields valid");

            // 5. Mark deal as won/lost in Pipedrive
            logger.LogInformation("[MarkDealWonLost] Step 5: Marking deal {DealId} as {Status}",
                dealId, markRequest.Status);

            var updatedPipedriveDeal = await pipedriveApiClient.MarkDealWonLostAsync(
                session,
                dealId,
                markRequest.Status,
                markRequest.LostReason);

            logger.LogInformation("[MarkDealWonLost] Step 5 PASSED: Deal marked as {Status} - Id: {DealId}",
                markRequest.Status, updatedPipedriveDeal.Id);

            // 6. Fetch metadata for enrichment
            logger.LogInformation("[MarkDealWonLost] Step 6: Fetching stages and pipelines for enrichment");
            var stagesResponse = await pipedriveApiClient.GetStagesAsync(session);
            var pipelinesResponse = await pipedriveApiClient.GetPipelinesAsync(session);

            logger.LogInformation("[MarkDealWonLost] Step 6 PASSED: Metadata fetched");

            // 7. Transform deal with enrichment
            logger.LogInformation("[MarkDealWonLost] Step 7: Transforming deal");
            var transformedDeals = dealTransformService.TransformDeals(
                new[] { updatedPipedriveDeal },
                stagesResponse.Data ?? Array.Empty<PipedriveStage>(),
                pipelinesResponse.Data ?? Array.Empty<PipedrivePipeline>()
            );

            if (transformedDeals.Count == 0)
            {
                logger.LogError("[MarkDealWonLost] FAILED Step 7: Deal transformation failed");
                return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Failed to transform deal data");
            }

            var transformedDeal = transformedDeals[0];
            logger.LogInformation("[MarkDealWonLost] Step 7 PASSED: Deal transformed - Status: {Status}, LostReason: {LostReason}",
                transformedDeal.Status, transformedDeal.LostReason ?? "N/A");

            // 8. Return success response
            logger.LogInformation("[MarkDealWonLost] Step 8: Building response");
            var responseData = new
            {
                success = true,
                data = transformedDeal
            };

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            var json = JsonSerializer.Serialize(responseData, JsonOptions);
            await response.WriteStringAsync(json);
            httpRequestLogger.LogResponse("MarkDealWonLost", (int)HttpStatusCode.OK, responseData);

            logger.LogInformation("[MarkDealWonLost] SUCCESS: Deal marked as {Status} successfully - Id: {DealId}",
                transformedDeal.Status, transformedDeal.Id);
            return response;
        }
        catch (PipedriveNotFoundException ex)
        {
            logger.LogWarning(ex, "[MarkDealWonLost] EXCEPTION: Deal {DealId} not found", dealId);
            return CreateErrorResponse(req, HttpStatusCode.NotFound, $"Deal not found");
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning(ex, "[MarkDealWonLost] EXCEPTION: Pipedrive authentication failed");
            return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid or expired session");
        }
        catch (PipedriveRateLimitException ex)
        {
            logger.LogWarning(ex, "[MarkDealWonLost] EXCEPTION: Rate limit exceeded");
            return CreateErrorResponse(req, HttpStatusCode.TooManyRequests, "Rate limit exceeded");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[MarkDealWonLost] EXCEPTION: Error marking deal {DealId} - Message: {Message}",
                dealId, ex.Message);
            return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Failed to update deal status");
        }
    }

    private HttpResponseData CreateErrorResponse(HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "application/json");

        var errorBody = new { error = message };
        response.WriteString(JsonSerializer.Serialize(errorBody));
        httpRequestLogger.LogResponse("MarkDealWonLost", (int)statusCode, errorBody);

        return response;
    }
}
