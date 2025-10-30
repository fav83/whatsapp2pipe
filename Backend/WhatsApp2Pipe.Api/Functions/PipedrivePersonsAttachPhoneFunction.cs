using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class PipedrivePersonsAttachPhoneFunction
{
    private readonly ILogger<PipedrivePersonsAttachPhoneFunction> logger;
    private readonly ITableStorageService tableStorageService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly PersonTransformService transformService;

    // Cached JSON serializer options for camelCase output
    private static readonly System.Text.Json.JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
    };

    public PipedrivePersonsAttachPhoneFunction(
        ILogger<PipedrivePersonsAttachPhoneFunction> logger,
        ITableStorageService tableStorageService,
        IPipedriveApiClient pipedriveApiClient,
        PersonTransformService transformService)
    {
        this.logger = logger;
        this.tableStorageService = tableStorageService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.transformService = transformService;
    }

    [Function("PipedrivePersonsAttachPhone")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options", Route = "pipedrive/persons/{personId}/attach-phone")] HttpRequestData req,
        string personId)
    {
        // Handle CORS preflight
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return req.CreateResponse(HttpStatusCode.OK);
        }

        logger.LogInformation($"PipedrivePersonsAttachPhone function triggered for person {personId}");

        try
        {
            // Parse person ID
            if (!int.TryParse(personId, out var personIdInt))
            {
                logger.LogWarning($"Invalid person ID: {personId}");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Invalid person ID");
                return badRequestResponse;
            }

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

            // Parse request body
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                logger.LogWarning("Empty request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Request body is required");
                return badRequestResponse;
            }

            var attachRequest = JsonSerializer.Deserialize<AttachPhoneRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (attachRequest == null)
            {
                logger.LogWarning("Invalid request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Invalid request body");
                return badRequestResponse;
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(attachRequest.Phone))
            {
                logger.LogWarning("Missing required field: phone");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Phone is required");
                return badRequestResponse;
            }

            // Validate phone format (E.164)
            if (!attachRequest.Phone.StartsWith("+"))
            {
                logger.LogWarning($"Invalid phone format: {attachRequest.Phone}");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Phone must be in E.164 format (start with +)");
                return badRequestResponse;
            }

            // Fetch existing person from Pipedrive (automatic token refresh handled internally)
            logger.LogInformation($"Fetching existing person: id={personIdInt}");
            var existingPersonResponse = await pipedriveApiClient.GetPersonAsync(session, personIdInt);

            if (existingPersonResponse.Data == null)
            {
                logger.LogError($"Pipedrive returned null data for person {personIdInt}");
                return req.CreateResponse(HttpStatusCode.NotFound);
            }

            var existingPerson = existingPersonResponse.Data;

            // Check for duplicate phone
            var existingPhones = existingPerson.Phone ?? new List<PipedrivePhone>();
            if (existingPhones.Any(p => p.Value == attachRequest.Phone))
            {
                logger.LogInformation($"Phone {attachRequest.Phone} already exists for person {personIdInt}, returning as-is");
                var person = transformService.TransformPerson(existingPerson);
                var duplicateResponse = req.CreateResponse(HttpStatusCode.OK);
                duplicateResponse.Headers.Add("Content-Type", "application/json");
                var duplicateJson = System.Text.Json.JsonSerializer.Serialize(person, JsonOptions);
                await duplicateResponse.WriteStringAsync(duplicateJson);
                return duplicateResponse;
            }

            // Merge phones: preserve existing phones and add new one
            var updatedPhones = existingPhones.Select(p => new PipedrivePhoneInput
            {
                Value = p.Value,
                Label = p.Label ?? "other",
                Primary = p.Primary
            }).ToList();

            updatedPhones.Add(new PipedrivePhoneInput
            {
                Value = attachRequest.Phone,
                Label = "WhatsApp",
                Primary = false  // BRD requirement: NOT primary
            });

            // Update person in Pipedrive (automatic token refresh handled internally)
            logger.LogInformation($"Updating person {personIdInt} with new phone {attachRequest.Phone}");
            var updateRequest = new PipedriveUpdatePersonRequest
            {
                Phone = updatedPhones
            };

            var updatedPersonResponse = await pipedriveApiClient.UpdatePersonAsync(session, personIdInt, updateRequest);

            if (updatedPersonResponse.Data == null)
            {
                logger.LogError($"Pipedrive returned null data after update for person {personIdInt}");
                return req.CreateResponse(HttpStatusCode.InternalServerError);
            }

            // Transform response to minimal format
            var updatedPerson = transformService.TransformPerson(updatedPersonResponse.Data);

            logger.LogInformation($"Phone attached successfully to person {personIdInt}");

            // Return 200 OK with updated person data (camelCase JSON)
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            var json = System.Text.Json.JsonSerializer.Serialize(updatedPerson, JsonOptions);
            await response.WriteStringAsync(json);
            return response;
        }
        catch (PipedriveNotFoundException ex)
        {
            logger.LogWarning($"Person not found: {ex.Message}");
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning(ex, "Token refresh failed - session_expired");
            var response = req.CreateResponse(HttpStatusCode.Unauthorized);
            await response.WriteAsJsonAsync(new { error = "session_expired", message = "Refresh token expired, please sign in again" });
            return response;
        }
        catch (PipedriveRateLimitException)
        {
            logger.LogWarning("Pipedrive rate limit exceeded");
            return req.CreateResponse((HttpStatusCode)429);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error attaching phone to person in Pipedrive");
            return req.CreateResponse(HttpStatusCode.InternalServerError);
        }
    }
}
