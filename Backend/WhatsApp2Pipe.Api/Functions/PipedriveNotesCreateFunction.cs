using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class PipedriveNotesCreateFunction
{
    private readonly ILogger<PipedriveNotesCreateFunction> logger;
    private readonly ISessionService sessionService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly HttpRequestLogger httpRequestLogger;

    public PipedriveNotesCreateFunction(
        ILogger<PipedriveNotesCreateFunction> logger,
        ISessionService sessionService,
        IPipedriveApiClient pipedriveApiClient,
        HttpRequestLogger httpRequestLogger)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.httpRequestLogger = httpRequestLogger;
    }

    [Function("PipedriveNotesCreate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options", Route = "pipedrive/notes")] HttpRequestData req)
    {
        // Handle CORS preflight
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return req.CreateResponse(HttpStatusCode.OK);
        }

        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("PipedriveNotesCreate function triggered");

        try
        {
            // Extract and validate Authorization header
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("Missing Authorization header");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                logger.LogWarning("Invalid Authorization header format");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            var verificationCode = authHeader.Substring("Bearer ".Length);

            // Retrieve session from database
            var session = await sessionService.GetSessionAsync(verificationCode);
            if (session == null)
            {
                logger.LogWarning("Invalid or expired verification code");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            // Parse request body
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                logger.LogWarning("Empty request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Request body is required");
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.BadRequest, "Request body is required");
                return badRequestResponse;
            }

            var createRequest = JsonSerializer.Deserialize<CreateNoteRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (createRequest == null)
            {
                logger.LogWarning("Invalid request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Invalid request body");
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.BadRequest, "Invalid request body");
                return badRequestResponse;
            }

            // Validate required fields
            if (createRequest.PersonId <= 0)
            {
                logger.LogWarning("Invalid personId: {PersonId}", createRequest.PersonId);
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("PersonId must be greater than 0");
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.BadRequest, "PersonId must be greater than 0");
                return badRequestResponse;
            }

            if (string.IsNullOrWhiteSpace(createRequest.Content))
            {
                logger.LogWarning("Missing or empty content");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Content is required");
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.BadRequest, "Content is required");
                return badRequestResponse;
            }

            // Call Pipedrive API
            logger.LogInformation(
                "Creating note in Pipedrive: personId={PersonId}, contentLength={Length}",
                createRequest.PersonId,
                createRequest.Content.Length
            );

            var pipedriveResponse = await pipedriveApiClient.CreateNoteAsync(
                session,
                createRequest.PersonId,
                createRequest.Content
            );

            if (pipedriveResponse.Data == null)
            {
                logger.LogError("Pipedrive returned null data");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.InternalServerError);
                return errorResponse;
            }

            logger.LogInformation("Note created successfully: id={NoteId}", pipedriveResponse.Data.Id);

            // Return 201 Created with empty body
            var response = req.CreateResponse(HttpStatusCode.Created);
            httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Created);
            return response;
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning(ex, "Token refresh failed - session_expired");
            var response = req.CreateResponse(HttpStatusCode.Unauthorized);
            var errorBody = new { error = "session_expired", message = "Refresh token expired, please sign in again" };
            await response.WriteAsJsonAsync(errorBody);
            httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Unauthorized, errorBody);
            return response;
        }
        catch (PipedriveRateLimitException)
        {
            logger.LogWarning("Pipedrive rate limit exceeded");
            var rateLimitResponse = req.CreateResponse((HttpStatusCode)429);
            httpRequestLogger.LogResponse("PipedriveNotesCreate", 429);
            return rateLimitResponse;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating note in Pipedrive");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.InternalServerError);
            return errorResponse;
        }
    }
}
