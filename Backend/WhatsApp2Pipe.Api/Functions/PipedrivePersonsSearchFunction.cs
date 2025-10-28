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
    private readonly ITableStorageService tableStorageService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly PersonTransformService transformService;

    public PipedrivePersonsSearchFunction(
        ILogger<PipedrivePersonsSearchFunction> logger,
        ITableStorageService tableStorageService,
        IPipedriveApiClient pipedriveApiClient,
        PersonTransformService transformService)
    {
        this.logger = logger;
        this.tableStorageService = tableStorageService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.transformService = transformService;
    }

    [Function("PipedrivePersonsSearch")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "pipedrive/persons/search")] HttpRequestData req)
    {
        logger.LogInformation("PipedrivePersonsSearch function triggered");

        try
        {
            // Extract and validate Authorization header
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("Missing Authorization header");
                return req.CreateResponse(HttpStatusCode.Unauthorized);
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                logger.LogWarning("Invalid Authorization header format");
                return req.CreateResponse(HttpStatusCode.Unauthorized);
            }

            var verificationCode = authHeader.Substring("Bearer ".Length);

            // Retrieve session from Azure Table Storage
            var session = await tableStorageService.GetSessionAsync(verificationCode);
            if (session == null || session.SessionExpiresAt < DateTimeOffset.UtcNow)
            {
                logger.LogWarning($"Invalid or expired verification code");
                return req.CreateResponse(HttpStatusCode.Unauthorized);
            }

            // Extract query parameters
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var term = query["term"];
            var fields = query["fields"];

            if (string.IsNullOrEmpty(term) || string.IsNullOrEmpty(fields))
            {
                logger.LogWarning("Missing required query parameters: term or fields");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Missing required query parameters: term and fields");
                return badRequestResponse;
            }

            // Call Pipedrive API
            logger.LogInformation($"Searching Pipedrive persons: term={term}, fields={fields}");
            var pipedriveResponse = await pipedriveApiClient.SearchPersonsAsync(session.AccessToken, term, fields);

            // Transform response to minimal format
            var persons = new List<Person>();
            if (pipedriveResponse.Data?.Items != null)
            {
                foreach (var item in pipedriveResponse.Data.Items)
                {
                    if (item.Item != null)
                    {
                        persons.Add(transformService.TransformPerson(item.Item));
                    }
                }
            }

            logger.LogInformation($"Found {persons.Count} persons");

            // Return transformed persons array
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(persons);
            return response;
        }
        catch (PipedriveUnauthorizedException)
        {
            logger.LogWarning("Pipedrive access token is invalid or expired");
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }
        catch (PipedriveRateLimitException)
        {
            logger.LogWarning("Pipedrive rate limit exceeded");
            return req.CreateResponse((HttpStatusCode)429);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error searching persons in Pipedrive");
            return req.CreateResponse(HttpStatusCode.InternalServerError);
        }
    }
}
