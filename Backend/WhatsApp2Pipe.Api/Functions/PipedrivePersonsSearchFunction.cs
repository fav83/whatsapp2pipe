using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class PipedrivePersonsSearchFunction
{
    private readonly ILogger<PipedrivePersonsSearchFunction> logger;
    private readonly ISessionService sessionService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly PersonTransformService transformService;
    private readonly HttpRequestLogger httpRequestLogger;

    // Cached JSON serializer options for camelCase output
    private static readonly System.Text.Json.JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
    };

    public PipedrivePersonsSearchFunction(
        ILogger<PipedrivePersonsSearchFunction> logger,
        ISessionService sessionService,
        IPipedriveApiClient pipedriveApiClient,
        PersonTransformService transformService,
        HttpRequestLogger httpRequestLogger)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.transformService = transformService;
        this.httpRequestLogger = httpRequestLogger;
    }

    [Function("PipedrivePersonsSearch")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "options", Route = "pipedrive/persons/search")] HttpRequestData req)
    {
        // Handle CORS preflight
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return req.CreateResponse(HttpStatusCode.OK);
        }

        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("[PipedrivePersonsSearch] Function triggered - Method: {Method}, URL: {Url}", req.Method, req.Url);

        try
        {
            // Extract and validate Authorization header
            logger.LogInformation("[PipedrivePersonsSearch] Step 1: Checking Authorization header");
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("[PipedrivePersonsSearch] FAILED Step 1: Missing Authorization header");
                return req.CreateResponse(HttpStatusCode.Unauthorized);
            }

            var authHeader = authHeaders.FirstOrDefault();
            logger.LogInformation("[PipedrivePersonsSearch] Authorization header present");

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                logger.LogWarning("[PipedrivePersonsSearch] FAILED Step 1: Invalid Authorization header format - Header: {AuthHeader}", authHeader);
                return req.CreateResponse(HttpStatusCode.Unauthorized);
            }

            var verificationCode = authHeader.Substring("Bearer ".Length);
            logger.LogInformation("[PipedrivePersonsSearch] Step 1 PASSED: Verification code extracted (length: {Length})", verificationCode.Length);

            // Retrieve session from SQL Database (expiration checked automatically)
            logger.LogInformation("[PipedrivePersonsSearch] Step 2: Retrieving session from database");
            var session = await sessionService.GetSessionAsync(verificationCode);

            if (session == null)
            {
                logger.LogWarning("[PipedrivePersonsSearch] FAILED Step 2: Session not found or expired");
                return req.CreateResponse(HttpStatusCode.Unauthorized);
            }

            logger.LogInformation("[PipedrivePersonsSearch] Step 2 PASSED: Valid session retrieved - User: {UserId}, Company: {CompanyId}",
                session.UserId, session.CompanyId);

            // Extract query parameters
            logger.LogInformation("[PipedrivePersonsSearch] Step 3: Extracting query parameters");
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var term = query["term"];
            var fields = query["fields"];

            logger.LogInformation("[PipedrivePersonsSearch] Query parameters - term: {Term}, fields: {Fields}", term ?? "NULL", fields ?? "NULL");

            if (string.IsNullOrEmpty(term) || string.IsNullOrEmpty(fields))
            {
                logger.LogWarning("[PipedrivePersonsSearch] FAILED Step 3: Missing required query parameters - term: {Term}, fields: {Fields}", term ?? "NULL", fields ?? "NULL");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Missing required query parameters: term and fields");
                return badRequestResponse;
            }

            logger.LogInformation("[PipedrivePersonsSearch] Step 3 PASSED: Query parameters validated");

            // Call Pipedrive API (automatic token refresh handled internally)
            logger.LogInformation("[PipedrivePersonsSearch] Step 4: Calling Pipedrive API - term: {Term}, fields: {Fields}", term, fields);
            var pipedriveResponse = await pipedriveApiClient.SearchPersonsAsync(session, term, fields);
            logger.LogInformation("[PipedrivePersonsSearch] Step 4 COMPLETED: Pipedrive API call finished");

            // Transform response to minimal format
            logger.LogInformation("[PipedrivePersonsSearch] Step 5: Transforming Pipedrive response - Success: {Success}, HasData: {HasData}", pipedriveResponse.Success, pipedriveResponse.Data != null);

            var persons = new List<Person>();
            if (pipedriveResponse.Data?.Items != null)
            {
                var items = pipedriveResponse.Data.Items;
                var itemCount = items.Count();
                logger.LogInformation("[PipedrivePersonsSearch] Found {Count} items in Pipedrive response", itemCount);
                foreach (var item in items)
                {
                    if (item.Item != null)
                    {
                        persons.Add(transformService.TransformPerson(item.Item));
                    }
                }
            }
            else
            {
                logger.LogInformation("[PipedrivePersonsSearch] No items in Pipedrive response");
            }

            var personCount = persons.Count;
            logger.LogInformation("[PipedrivePersonsSearch] Step 5 COMPLETED: Transformed {Count} persons", personCount);

            // Return transformed persons array with camelCase JSON
            logger.LogInformation("[PipedrivePersonsSearch] Step 6: Returning response with {Count} persons", personCount);
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            var json = System.Text.Json.JsonSerializer.Serialize(persons, JsonOptions);
            await response.WriteStringAsync(json);
            logger.LogInformation("[PipedrivePersonsSearch] SUCCESS: Request completed successfully");
            return response;
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning(ex, "[PipedrivePersonsSearch] EXCEPTION: Token refresh failed - session_expired");
            var response = req.CreateResponse(HttpStatusCode.Unauthorized);
            await response.WriteAsJsonAsync(new { error = "session_expired", message = "Refresh token expired, please sign in again" });
            return response;
        }
        catch (PipedriveRateLimitException ex)
        {
            logger.LogWarning(ex, "[PipedrivePersonsSearch] EXCEPTION: Pipedrive rate limit exceeded");
            return req.CreateResponse((HttpStatusCode)429);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[PipedrivePersonsSearch] EXCEPTION: Error searching persons in Pipedrive - Message: {Message}, StackTrace: {StackTrace}", ex.Message, ex.StackTrace);
            return req.CreateResponse(HttpStatusCode.InternalServerError);
        }
    }
}
