using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WhatsApp2Pipe.Api.Functions;

public class UpdateDealFunction
{
    private readonly ILogger<UpdateDealFunction> logger;
    private readonly ISessionService sessionService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly DealTransformService dealTransformService;
    private readonly HttpRequestLogger httpRequestLogger;
    private readonly FeatureFlagsSettings featureFlagsSettings;

    // Cached JSON serializer options for camelCase output
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public UpdateDealFunction(
        ILogger<UpdateDealFunction> logger,
        ISessionService sessionService,
        IPipedriveApiClient pipedriveApiClient,
        DealTransformService dealTransformService,
        HttpRequestLogger httpRequestLogger,
        IOptions<FeatureFlagsSettings> featureFlagsSettings)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.dealTransformService = dealTransformService;
        this.httpRequestLogger = httpRequestLogger;
        this.featureFlagsSettings = featureFlagsSettings.Value;
    }

    [Function("UpdateDeal")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "pipedrive/deals/{dealId}")]
        HttpRequestData req,
        int dealId)
    {
        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("[UpdateDeal] Function triggered - DealId: {DealId}", dealId);

        try
        {
            // 1. Extract and validate Authorization header
            logger.LogInformation("[UpdateDeal] Step 1: Checking Authorization header");
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("[UpdateDeal] FAILED Step 1: Missing Authorization header");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Authorization header required");
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("[UpdateDeal] FAILED Step 1: Invalid Authorization header format");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid Authorization header format");
            }

            var verificationCode = authHeader.Substring("Bearer ".Length).Trim();
            logger.LogInformation("[UpdateDeal] Step 1 PASSED: Verification code extracted");

            // 2. Validate session
            logger.LogInformation("[UpdateDeal] Step 2: Retrieving session");
            var session = await sessionService.GetSessionAsync(verificationCode);

            if (session == null || session.SessionExpiresAt < DateTime.UtcNow)
            {
                logger.LogWarning("[UpdateDeal] FAILED Step 2: Invalid or expired session");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid or expired session");
            }

            logger.LogInformation("[UpdateDeal] Step 2 PASSED: Valid session - User: {UserId}, Company: {CompanyId}",
                session.UserId, session.CompanyId);

            // 2b. Check feature flag
            if (!featureFlagsSettings.EnableDeals)
            {
                logger.LogWarning("[UpdateDeal] BLOCKED: Deals feature is disabled");
                return CreateErrorResponse(req, HttpStatusCode.Forbidden, "Deals feature is not enabled");
            }

            // 3. Parse request body
            logger.LogInformation("[UpdateDeal] Step 3: Parsing request body");
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                logger.LogWarning("[UpdateDeal] FAILED Step 3: Empty request body");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Request body is required");
            }

            var updateRequest = JsonSerializer.Deserialize<UpdateDealRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (updateRequest == null)
            {
                logger.LogWarning("[UpdateDeal] FAILED Step 3: Invalid request body");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid request body");
            }

            logger.LogInformation("[UpdateDeal] Step 3 PASSED: Request parsed - PipelineId: {PipelineId}, StageId: {StageId}",
                updateRequest.PipelineId, updateRequest.StageId);

            // 4. Validate required fields
            logger.LogInformation("[UpdateDeal] Step 4: Validating required fields");
            if (updateRequest.PipelineId <= 0 || updateRequest.StageId <= 0)
            {
                logger.LogWarning("[UpdateDeal] FAILED Step 4: Invalid pipelineId or stageId");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "pipelineId and stageId are required and must be positive integers");
            }

            logger.LogInformation("[UpdateDeal] Step 4 PASSED: All required fields valid");

            // 5. Update deal in Pipedrive
            logger.LogInformation("[UpdateDeal] Step 5: Updating deal {DealId} to stage {StageId} (pipeline {PipelineId})",
                dealId, updateRequest.StageId, updateRequest.PipelineId);

            var updatedPipedriveDeal = await pipedriveApiClient.UpdateDealAsync(session, dealId, updateRequest.StageId);

            logger.LogInformation("[UpdateDeal] Step 5 PASSED: Deal updated - Id: {DealId}", updatedPipedriveDeal.Id);

            // 6. Fetch metadata for enrichment
            logger.LogInformation("[UpdateDeal] Step 6: Fetching stages and pipelines for enrichment");
            var stagesResponse = await pipedriveApiClient.GetStagesAsync(session);
            var pipelinesResponse = await pipedriveApiClient.GetPipelinesAsync(session);

            logger.LogInformation("[UpdateDeal] Step 6 PASSED: Metadata fetched");

            // 7. Transform deal with enrichment
            logger.LogInformation("[UpdateDeal] Step 7: Transforming deal");
            var transformedDeals = dealTransformService.TransformDeals(
                new[] { updatedPipedriveDeal },
                stagesResponse.Data ?? Array.Empty<PipedriveStage>(),
                pipelinesResponse.Data ?? Array.Empty<PipedrivePipeline>()
            );

            if (transformedDeals.Count == 0)
            {
                logger.LogError("[UpdateDeal] FAILED Step 7: Deal transformation failed");
                return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Failed to transform deal data");
            }

            var transformedDeal = transformedDeals[0];
            logger.LogInformation("[UpdateDeal] Step 7 PASSED: Deal transformed - Stage: {StageName}, Pipeline: {PipelineName}",
                transformedDeal.Stage.Name, transformedDeal.Pipeline.Name);

            // 8. Return success response
            logger.LogInformation("[UpdateDeal] Step 8: Building response");
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            var json = JsonSerializer.Serialize(transformedDeal, JsonOptions);
            await response.WriteStringAsync(json);
            httpRequestLogger.LogResponse("UpdateDeal", (int)HttpStatusCode.OK, transformedDeal);

            logger.LogInformation("[UpdateDeal] SUCCESS: Deal updated successfully - Id: {DealId}", transformedDeal.Id);
            return response;
        }
        catch (PipedriveNotFoundException ex)
        {
            logger.LogWarning(ex, "[UpdateDeal] EXCEPTION: Deal {DealId} not found", dealId);
            return CreateErrorResponse(req, HttpStatusCode.NotFound, $"Deal {dealId} not found");
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning(ex, "[UpdateDeal] EXCEPTION: Pipedrive authentication failed");
            return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Pipedrive authentication failed");
        }
        catch (PipedriveRateLimitException ex)
        {
            logger.LogWarning(ex, "[UpdateDeal] EXCEPTION: Rate limit exceeded");
            return CreateErrorResponse(req, HttpStatusCode.TooManyRequests, "Rate limit exceeded");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[UpdateDeal] EXCEPTION: Error updating deal {DealId} - Message: {Message}", dealId, ex.Message);
            return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Internal server error");
        }
    }

    private HttpResponseData CreateErrorResponse(HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "application/json");

        var errorBody = new { error = message };
        response.WriteString(JsonSerializer.Serialize(errorBody));
        httpRequestLogger.LogResponse("UpdateDeal", (int)statusCode, errorBody);

        return response;
    }
}

public class UpdateDealRequest
{
    [JsonPropertyName("pipelineId")]
    public int PipelineId { get; set; }

    [JsonPropertyName("stageId")]
    public int StageId { get; set; }
}
