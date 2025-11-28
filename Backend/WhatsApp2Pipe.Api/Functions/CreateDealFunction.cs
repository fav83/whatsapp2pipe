using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;
using System.Text.Json;

namespace WhatsApp2Pipe.Api.Functions;

public class CreateDealFunction
{
    private readonly ILogger<CreateDealFunction> logger;
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

    public CreateDealFunction(
        ILogger<CreateDealFunction> logger,
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

    [Function("CreateDeal")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pipedrive/deals")]
        HttpRequestData req)
    {
        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("[CreateDeal] Function triggered");

        try
        {
            // 1. Extract and validate Authorization header
            logger.LogInformation("[CreateDeal] Step 1: Checking Authorization header");
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("[CreateDeal] FAILED Step 1: Missing Authorization header");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Authorization header required");
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("[CreateDeal] FAILED Step 1: Invalid Authorization header format");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid Authorization header format");
            }

            var verificationCode = authHeader.Substring("Bearer ".Length).Trim();
            logger.LogInformation("[CreateDeal] Step 1 PASSED: Verification code extracted");

            // 2. Validate session
            logger.LogInformation("[CreateDeal] Step 2: Retrieving session");
            var session = await sessionService.GetSessionAsync(verificationCode);

            if (session == null || session.SessionExpiresAt < DateTime.UtcNow)
            {
                logger.LogWarning("[CreateDeal] FAILED Step 2: Invalid or expired session");
                return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Invalid or expired session");
            }

            logger.LogInformation("[CreateDeal] Step 2 PASSED: Valid session - User: {UserId}, Company: {CompanyId}",
                session.UserId, session.CompanyId);

            // 2b. Check feature flag
            if (!featureFlagsSettings.EnableDeals)
            {
                logger.LogWarning("[CreateDeal] BLOCKED: Deals feature is disabled");
                return CreateErrorResponse(req, HttpStatusCode.Forbidden, "Deals feature is not enabled");
            }

            // 3. Parse request body
            logger.LogInformation("[CreateDeal] Step 3: Parsing request body");
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                logger.LogWarning("[CreateDeal] FAILED Step 3: Empty request body");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Request body is required");
            }

            var createRequest = JsonSerializer.Deserialize<CreateDealRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (createRequest == null)
            {
                logger.LogWarning("[CreateDeal] FAILED Step 3: Invalid request body");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid request body");
            }

            logger.LogInformation("[CreateDeal] Step 3 PASSED: Request parsed - Title: {Title}, PersonId: {PersonId}",
                createRequest.Title, createRequest.PersonId);

            // 4. Validate required fields
            logger.LogInformation("[CreateDeal] Step 4: Validating required fields");
            if (string.IsNullOrWhiteSpace(createRequest.Title))
            {
                logger.LogWarning("[CreateDeal] FAILED Step 4: Missing title");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Title is required");
            }

            if (createRequest.PersonId <= 0)
            {
                logger.LogWarning("[CreateDeal] FAILED Step 4: Invalid personId");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Valid personId is required");
            }

            if (createRequest.PipelineId <= 0)
            {
                logger.LogWarning("[CreateDeal] FAILED Step 4: Invalid pipelineId");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Valid pipelineId is required");
            }

            if (createRequest.StageId <= 0)
            {
                logger.LogWarning("[CreateDeal] FAILED Step 4: Invalid stageId");
                return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Valid stageId is required");
            }

            logger.LogInformation("[CreateDeal] Step 4 PASSED: All required fields valid");

            // 5. Create deal in Pipedrive
            logger.LogInformation("[CreateDeal] Step 5: Creating deal in Pipedrive");
            var pipedriveRequest = new PipedriveCreateDealRequest
            {
                Title = createRequest.Title.Trim(),
                PersonId = createRequest.PersonId,
                PipelineId = createRequest.PipelineId,
                StageId = createRequest.StageId,
                UserId = session.User.PipedriveUserId,
                Value = createRequest.Value,
                Status = "open"
            };

            var dealResponse = await pipedriveApiClient.CreateDealAsync(session, pipedriveRequest);

            if (dealResponse.Data == null)
            {
                logger.LogError("[CreateDeal] FAILED Step 5: Deal created but data is null");
                return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Failed to create deal");
            }

            logger.LogInformation("[CreateDeal] Step 5 PASSED: Deal created - Id: {DealId}", dealResponse.Data.Id);

            // 6. Fetch metadata for enrichment
            logger.LogInformation("[CreateDeal] Step 6: Fetching stages and pipelines for enrichment");
            var stagesResponse = await pipedriveApiClient.GetStagesAsync(session);
            var pipelinesResponse = await pipedriveApiClient.GetPipelinesAsync(session);

            logger.LogInformation("[CreateDeal] Step 6 PASSED: Metadata fetched");

            // 7. Transform deal with enrichment
            logger.LogInformation("[CreateDeal] Step 7: Transforming deal");
            var transformedDeals = dealTransformService.TransformDeals(
                new[] { dealResponse.Data },
                stagesResponse.Data ?? Array.Empty<PipedriveStage>(),
                pipelinesResponse.Data ?? Array.Empty<PipedrivePipeline>()
            );

            if (transformedDeals.Count == 0)
            {
                logger.LogError("[CreateDeal] FAILED Step 7: Deal transformation failed");
                return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Failed to transform deal");
            }

            var transformedDeal = transformedDeals[0];
            logger.LogInformation("[CreateDeal] Step 7 PASSED: Deal transformed");

            // 8. Return success response
            logger.LogInformation("[CreateDeal] Step 8: Building response");
            var response = req.CreateResponse(HttpStatusCode.Created);
            response.Headers.Add("Content-Type", "application/json");

            var json = JsonSerializer.Serialize(transformedDeal, JsonOptions);
            await response.WriteStringAsync(json);
            httpRequestLogger.LogResponse("CreateDeal", (int)HttpStatusCode.Created, transformedDeal);

            logger.LogInformation("[CreateDeal] SUCCESS: Deal created successfully - Id: {DealId}", transformedDeal.Id);
            return response;
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning(ex, "[CreateDeal] EXCEPTION: Pipedrive authentication failed");
            return CreateErrorResponse(req, HttpStatusCode.Unauthorized, "Pipedrive authentication failed");
        }
        catch (PipedriveRateLimitException ex)
        {
            logger.LogWarning(ex, "[CreateDeal] EXCEPTION: Rate limit exceeded");
            return CreateErrorResponse(req, HttpStatusCode.TooManyRequests, "Rate limit exceeded");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[CreateDeal] EXCEPTION: Error creating deal - Message: {Message}", ex.Message);
            return CreateErrorResponse(req, HttpStatusCode.InternalServerError, "Internal server error");
        }
    }

    private HttpResponseData CreateErrorResponse(HttpRequestData req, HttpStatusCode statusCode, string message)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "application/json");

        var errorBody = new { error = message };
        response.WriteString(JsonSerializer.Serialize(errorBody));
        httpRequestLogger.LogResponse("CreateDeal", (int)statusCode, errorBody);

        return response;
    }
}
