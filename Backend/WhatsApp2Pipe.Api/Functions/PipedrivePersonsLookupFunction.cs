using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class PipedrivePersonsLookupFunction
{
    private readonly ILogger<PipedrivePersonsLookupFunction> logger;
    private readonly ISessionService sessionService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly PersonTransformService personTransformService;
    private readonly DealTransformService dealTransformService;
    private readonly HttpRequestLogger httpRequestLogger;
    private readonly FeatureFlagsSettings featureFlagsSettings;

    // Cached JSON serializer options for camelCase output
    private static readonly System.Text.Json.JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
    };

    public PipedrivePersonsLookupFunction(
        ILogger<PipedrivePersonsLookupFunction> logger,
        ISessionService sessionService,
        IPipedriveApiClient pipedriveApiClient,
        PersonTransformService personTransformService,
        DealTransformService dealTransformService,
        HttpRequestLogger httpRequestLogger,
        IOptions<FeatureFlagsSettings> featureFlagsSettings)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.personTransformService = personTransformService;
        this.dealTransformService = dealTransformService;
        this.httpRequestLogger = httpRequestLogger;
        this.featureFlagsSettings = featureFlagsSettings.Value;
    }

    [Function("PipedrivePersonsLookup")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "options", Route = "pipedrive/persons/lookup")] HttpRequestData req)
    {
        // Handle CORS preflight
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return req.CreateResponse(HttpStatusCode.OK);
        }

        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("[PipedrivePersonsLookup] Function triggered - Method: {Method}, URL: {Url}", req.Method, req.Url);

        try
        {
            // Extract and validate Authorization header
            logger.LogInformation("[PipedrivePersonsLookup] Step 1: Checking Authorization header");
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("[PipedrivePersonsLookup] FAILED Step 1: Missing Authorization header");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorizedResponse.WriteAsJsonAsync(new { error = "Authorization header required" });
                httpRequestLogger.LogResponse("PipedrivePersonsLookup", (int)HttpStatusCode.Unauthorized, new { error = "Authorization header required" });
                return unauthorizedResponse;
            }

            var authHeader = authHeaders.FirstOrDefault();
            logger.LogInformation("[PipedrivePersonsLookup] Authorization header present");

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                logger.LogWarning("[PipedrivePersonsLookup] FAILED Step 1: Invalid Authorization header format");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorizedResponse.WriteAsJsonAsync(new { error = "Invalid Authorization header format" });
                httpRequestLogger.LogResponse("PipedrivePersonsLookup", (int)HttpStatusCode.Unauthorized, new { error = "Invalid Authorization header format" });
                return unauthorizedResponse;
            }

            var verificationCode = authHeader.Substring("Bearer ".Length);
            logger.LogInformation("[PipedrivePersonsLookup] Step 1 PASSED: Verification code extracted (length: {Length})", verificationCode.Length);

            // Retrieve session from database
            logger.LogInformation("[PipedrivePersonsLookup] Step 2: Retrieving session from database");
            var session = await sessionService.GetSessionAsync(verificationCode);

            if (session == null)
            {
                logger.LogWarning("[PipedrivePersonsLookup] FAILED Step 2: Session not found or expired");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorizedResponse.WriteAsJsonAsync(new { error = "Invalid or expired verification code" });
                httpRequestLogger.LogResponse("PipedrivePersonsLookup", (int)HttpStatusCode.Unauthorized, new { error = "Invalid or expired verification code" });
                return unauthorizedResponse;
            }

            logger.LogInformation("[PipedrivePersonsLookup] Step 2 PASSED: Valid session retrieved - User: {UserId}, Company: {CompanyId}",
                session.UserId, session.CompanyId);

            // Extract and validate phone parameter
            logger.LogInformation("[PipedrivePersonsLookup] Step 3: Extracting query parameters");
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var phone = query["phone"];

            logger.LogInformation("[PipedrivePersonsLookup] Query parameters - phone: {Phone}", phone ?? "NULL");

            if (string.IsNullOrEmpty(phone))
            {
                logger.LogWarning("[PipedrivePersonsLookup] FAILED Step 3: Missing required query parameter: phone");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(new { error = "Phone parameter is required" });
                httpRequestLogger.LogResponse("PipedrivePersonsLookup", (int)HttpStatusCode.BadRequest, new { error = "Phone parameter is required" });
                return badRequestResponse;
            }

            logger.LogInformation("[PipedrivePersonsLookup] Step 3 PASSED: Query parameters validated");

            // Step 4: Search person by phone
            logger.LogInformation("[PipedrivePersonsLookup] Step 4: Searching person by phone: {Phone}", phone);
            var searchResponse = await pipedriveApiClient.SearchPersonsAsync(session, phone, "phone");
            logger.LogInformation("[PipedrivePersonsLookup] Step 4 COMPLETED: Person search finished - Success: {Success}", searchResponse.Success);

            // Check if person was found
            if (searchResponse.Data?.Items == null || searchResponse.Data.Items.Length == 0 || searchResponse.Data.Items[0].Item == null)
            {
                logger.LogInformation("[PipedrivePersonsLookup] Person not found for phone: {Phone}", phone);
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                notFoundResponse.Headers.Add("Content-Type", "application/json");
                var notFoundBody = new
                {
                    person = (object?)null,
                    deals = new object[0]
                };
                var notFoundJson = System.Text.Json.JsonSerializer.Serialize(notFoundBody, JsonOptions);
                await notFoundResponse.WriteStringAsync(notFoundJson);
                httpRequestLogger.LogResponse("PipedrivePersonsLookup", (int)HttpStatusCode.NotFound, notFoundBody);
                return notFoundResponse;
            }

            var pipedrivePerson = searchResponse.Data.Items[0].Item!;
            logger.LogInformation("[PipedrivePersonsLookup] Person found: {PersonId} - {PersonName}", pipedrivePerson.Id, pipedrivePerson.Name);

            // Step 5: Fetch deals for person (with graceful degradation)
            List<Deal>? transformedDeals = null;
            string? dealsError = null;

            if (featureFlagsSettings.EnableDeals)
            {
                logger.LogInformation("[PipedrivePersonsLookup] Step 5: Fetching deals for person: {PersonId}", pipedrivePerson.Id);

                try
                {
                    // Fetch deals
                    var dealsResponse = await pipedriveApiClient.GetPersonDealsAsync(session, pipedrivePerson.Id);
                    logger.LogInformation("[PipedrivePersonsLookup] Deals fetched - Count: {Count}", dealsResponse.Data?.Length ?? 0);

                    // Fetch stages and pipelines for enrichment
                    var stagesResponse = await pipedriveApiClient.GetStagesAsync(session);
                    var pipelinesResponse = await pipedriveApiClient.GetPipelinesAsync(session);
                    logger.LogInformation("[PipedrivePersonsLookup] Metadata fetched - Stages: {StageCount}, Pipelines: {PipelineCount}",
                        stagesResponse.Data?.Length ?? 0, pipelinesResponse.Data?.Length ?? 0);

                    // Transform and sort deals
                    transformedDeals = dealTransformService.TransformDeals(
                        dealsResponse.Data ?? Array.Empty<PipedriveDeal>(),
                        stagesResponse.Data ?? Array.Empty<PipedriveStage>(),
                        pipelinesResponse.Data ?? Array.Empty<PipedrivePipeline>()
                    );
                    logger.LogInformation("[PipedrivePersonsLookup] Step 5 COMPLETED: Deals transformed - Count: {Count}", transformedDeals.Count);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[PipedrivePersonsLookup] Failed to fetch or transform deals for person {PersonId}", pipedrivePerson.Id);
                    dealsError = "Failed to fetch deals from Pipedrive";
                }
            }
            else
            {
                logger.LogInformation("[PipedrivePersonsLookup] Step 5: Skipping deals fetch - deals feature is disabled");
                transformedDeals = new List<Deal>();
            }

            // Step 6: Transform person
            logger.LogInformation("[PipedrivePersonsLookup] Step 6: Transforming person data");
            var transformedPerson = personTransformService.TransformPerson(pipedrivePerson);
            logger.LogInformation("[PipedrivePersonsLookup] Step 6 COMPLETED: Person transformed");

            // Step 7: Return response
            logger.LogInformation("[PipedrivePersonsLookup] Step 7: Building response");
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");

            object responseBody;
            if (dealsError != null)
            {
                // Partial failure: return person but indicate deals fetch failed
                responseBody = new
                {
                    person = transformedPerson,
                    deals = (object?)null,
                    dealsError
                };
            }
            else
            {
                // Full success: return person and deals
                responseBody = new
                {
                    person = transformedPerson,
                    deals = transformedDeals
                };
            }

            var json = System.Text.Json.JsonSerializer.Serialize(responseBody, JsonOptions);
            await response.WriteStringAsync(json);
            httpRequestLogger.LogResponse("PipedrivePersonsLookup", (int)HttpStatusCode.OK, responseBody);
            logger.LogInformation("[PipedrivePersonsLookup] SUCCESS: Request completed successfully");
            return response;
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning(ex, "[PipedrivePersonsLookup] EXCEPTION: Pipedrive authentication failed");
            var response = req.CreateResponse(HttpStatusCode.Unauthorized);
            var errorBody = new { error = "Pipedrive authentication failed" };
            await response.WriteAsJsonAsync(errorBody);
            httpRequestLogger.LogResponse("PipedrivePersonsLookup", (int)HttpStatusCode.Unauthorized, errorBody);
            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[PipedrivePersonsLookup] EXCEPTION: Error in PipedrivePersonsLookupFunction - Message: {Message}", ex.Message);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            var errorBody = new { error = "Internal server error" };
            await errorResponse.WriteAsJsonAsync(errorBody);
            httpRequestLogger.LogResponse("PipedrivePersonsLookup", (int)HttpStatusCode.InternalServerError, errorBody);
            return errorResponse;
        }
    }
}
