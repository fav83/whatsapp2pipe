using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class PipedrivePersonsCreateFunction
{
    private readonly ILogger<PipedrivePersonsCreateFunction> logger;
    private readonly ITableStorageService tableStorageService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly PersonTransformService transformService;

    public PipedrivePersonsCreateFunction(
        ILogger<PipedrivePersonsCreateFunction> logger,
        ITableStorageService tableStorageService,
        IPipedriveApiClient pipedriveApiClient,
        PersonTransformService transformService)
    {
        this.logger = logger;
        this.tableStorageService = tableStorageService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.transformService = transformService;
    }

    [Function("PipedrivePersonsCreate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options", Route = "pipedrive/persons")] HttpRequestData req)
    {
        // Handle CORS preflight
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return req.CreateResponse(HttpStatusCode.OK);
        }

        logger.LogInformation("PipedrivePersonsCreate function triggered");

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

            // Parse request body
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                logger.LogWarning("Empty request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Request body is required");
                return badRequestResponse;
            }

            var createRequest = JsonSerializer.Deserialize<CreatePersonRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (createRequest == null)
            {
                logger.LogWarning("Invalid request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Invalid request body");
                return badRequestResponse;
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(createRequest.Name))
            {
                logger.LogWarning("Missing required field: name");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Name is required");
                return badRequestResponse;
            }

            if (string.IsNullOrWhiteSpace(createRequest.Phone))
            {
                logger.LogWarning("Missing required field: phone");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Phone is required");
                return badRequestResponse;
            }

            // Validate phone format (E.164)
            if (!createRequest.Phone.StartsWith("+"))
            {
                logger.LogWarning($"Invalid phone format: {createRequest.Phone}");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Phone must be in E.164 format (start with +)");
                return badRequestResponse;
            }

            // Transform to Pipedrive format
            var pipedriveRequest = new PipedriveCreatePersonRequest
            {
                Name = createRequest.Name,
                Phone = new List<PipedrivePhoneInput>
                {
                    new PipedrivePhoneInput
                    {
                        Value = createRequest.Phone,
                        Label = "WhatsApp",
                        Primary = false  // BRD requirement: NOT primary
                    }
                }
            };

            // Add email if provided
            if (!string.IsNullOrWhiteSpace(createRequest.Email))
            {
                pipedriveRequest.Email = new List<PipedriveEmailInput>
                {
                    new PipedriveEmailInput
                    {
                        Value = createRequest.Email,
                        Label = "work",
                        Primary = true
                    }
                };
            }

            // Call Pipedrive API
            logger.LogInformation($"Creating person in Pipedrive: name={createRequest.Name}, phone={createRequest.Phone}");
            var pipedriveResponse = await pipedriveApiClient.CreatePersonAsync(session.AccessToken, pipedriveRequest);

            if (pipedriveResponse.Data == null)
            {
                logger.LogError("Pipedrive returned null data");
                return req.CreateResponse(HttpStatusCode.InternalServerError);
            }

            // Transform response to minimal format
            var person = transformService.TransformPerson(pipedriveResponse.Data);

            logger.LogInformation($"Person created successfully: id={person.Id}");

            // Return 201 Created with person data
            var response = req.CreateResponse(HttpStatusCode.Created);
            await response.WriteAsJsonAsync(person);
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
            logger.LogError(ex, "Error creating person in Pipedrive");
            return req.CreateResponse(HttpStatusCode.InternalServerError);
        }
    }
}
