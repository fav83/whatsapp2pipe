using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// Client for making authenticated requests to Pipedrive API with automatic token refresh
/// </summary>
public class PipedriveApiClient : IPipedriveApiClient
{
    private readonly HttpClient httpClient;
    private readonly PipedriveSettings config;
    private readonly ILogger<PipedriveApiClient> logger;
    private readonly PipedriveApiLogger apiLogger;
    private readonly IOAuthService oauthService;
    private readonly ISessionService sessionService;

    public PipedriveApiClient(
        HttpClient httpClient,
        PipedriveSettings config,
        ILogger<PipedriveApiClient> logger,
        IOAuthService oauthService,
        ISessionService sessionService)
    {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
        this.apiLogger = new PipedriveApiLogger(logger);
        this.oauthService = oauthService;
        this.sessionService = sessionService;
    }

    /// <summary>
    /// Search for persons by term and fields (with automatic token refresh)
    /// </summary>
    public async Task<PipedriveSearchResponse> SearchPersonsAsync(Session session, string term, string fields)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => SearchPersonsInternalAsync(accessToken, term, fields),
            "SearchPersons");
    }

    private async Task<PipedriveSearchResponse> SearchPersonsInternalAsync(string accessToken, string term, string fields)
    {
        var url = config.GetApiUrl($"/persons/search?term={Uri.EscapeDataString(term)}&fields={fields}");
        logger.LogInformation($"Searching persons: term={term}, fields={fields}");

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" }
        };
        apiLogger.LogRequest("GET", url, headers, null);

        var response = await httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("GET", url, (int)response.StatusCode, content);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive search failed: {response.StatusCode}");
            await HandleErrorResponse(response, content);
        }

        var result = JsonSerializer.Deserialize<PipedriveSearchResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null)
        {
            logger.LogError("Failed to deserialize Pipedrive search response");
            throw new PipedriveApiException("Invalid response from Pipedrive API - deserialization failed");
        }

        return result;
    }

    /// <summary>
    /// Create a new person in Pipedrive (with automatic token refresh)
    /// </summary>
    public async Task<PipedrivePersonResponse> CreatePersonAsync(Session session, PipedriveCreatePersonRequest request)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => CreatePersonInternalAsync(accessToken, request),
            "CreatePerson");
    }

    private async Task<PipedrivePersonResponse> CreatePersonInternalAsync(string accessToken, PipedriveCreatePersonRequest request)
    {
        var url = config.GetApiUrl("/persons");
        logger.LogInformation($"Creating person: name={request.Name}");

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" },
            { "Content-Type", "application/json" }
        };
        apiLogger.LogRequest("POST", url, headers, json);

        var response = await httpClient.SendAsync(httpRequest);
        var content = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("POST", url, (int)response.StatusCode, content);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive create person failed: {response.StatusCode}");
            await HandleErrorResponse(response, content);
        }

        var result = JsonSerializer.Deserialize<PipedrivePersonResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null)
        {
            logger.LogError("Failed to deserialize Pipedrive create person response");
            throw new PipedriveApiException("Invalid response from Pipedrive API - deserialization failed");
        }

        return result;
    }

    /// <summary>
    /// Get an existing person by ID (with automatic token refresh)
    /// </summary>
    public async Task<PipedrivePersonResponse> GetPersonAsync(Session session, int personId)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => GetPersonInternalAsync(accessToken, personId),
            "GetPerson");
    }

    private async Task<PipedrivePersonResponse> GetPersonInternalAsync(string accessToken, int personId)
    {
        var url = config.GetApiUrl($"/persons/{personId}");
        logger.LogInformation($"Getting person: id={personId}");

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" }
        };
        apiLogger.LogRequest("GET", url, headers, null);

        var response = await httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("GET", url, (int)response.StatusCode, content);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new PipedriveNotFoundException($"Person {personId} not found");
        }

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive get person failed: {response.StatusCode}");
            await HandleErrorResponse(response, content);
        }

        var result = JsonSerializer.Deserialize<PipedrivePersonResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null)
        {
            logger.LogError("Failed to deserialize Pipedrive get person response");
            throw new PipedriveApiException("Invalid response from Pipedrive API - deserialization failed");
        }

        return result;
    }

    /// <summary>
    /// Update an existing person (with automatic token refresh)
    /// </summary>
    public async Task<PipedrivePersonResponse> UpdatePersonAsync(Session session, int personId, PipedriveUpdatePersonRequest request)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => UpdatePersonInternalAsync(accessToken, personId, request),
            "UpdatePerson");
    }

    private async Task<PipedrivePersonResponse> UpdatePersonInternalAsync(string accessToken, int personId, PipedriveUpdatePersonRequest request)
    {
        var url = config.GetApiUrl($"/persons/{personId}");
        logger.LogInformation($"Updating person: id={personId}");

        var httpRequest = new HttpRequestMessage(HttpMethod.Put, url);
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" },
            { "Content-Type", "application/json" }
        };
        apiLogger.LogRequest("PUT", url, headers, json);

        var response = await httpClient.SendAsync(httpRequest);
        var content = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("PUT", url, (int)response.StatusCode, content);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive update person failed: {response.StatusCode}");
            await HandleErrorResponse(response, content);
        }

        var result = JsonSerializer.Deserialize<PipedrivePersonResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null)
        {
            logger.LogError("Failed to deserialize Pipedrive update person response");
            throw new PipedriveApiException("Invalid response from Pipedrive API - deserialization failed");
        }

        return result;
    }

    /// <summary>
    /// Get current user data from Pipedrive /users/me endpoint (with automatic token refresh)
    /// </summary>
    public async Task<PipedriveUserResponse> GetCurrentUserAsync(Session session)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => GetCurrentUserInternalAsync(accessToken, session.ApiDomain),
            "GetCurrentUser");
    }

    private async Task<PipedriveUserResponse> GetCurrentUserInternalAsync(string accessToken, string apiDomain)
    {
        var url = $"{apiDomain}/api/v1/users/me";
        logger.LogInformation("Fetching current user from Pipedrive API");

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" }
        };
        apiLogger.LogRequest("GET", url, headers, null);

        var response = await httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("GET", url, (int)response.StatusCode, content);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive /users/me failed: {response.StatusCode}");
            await HandleErrorResponse(response, content);
        }

        var result = JsonSerializer.Deserialize<PipedriveUserResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null || !result.Success)
        {
            logger.LogError("Invalid response from Pipedrive /users/me");
            throw new InvalidOperationException("Failed to deserialize Pipedrive user response");
        }

        logger.LogInformation("Successfully fetched user {UserId} from company {CompanyId}",
            result.Data.Id, result.Data.CompanyId);

        return result;
    }

    /// <summary>
    /// Create a note in Pipedrive attached to a person or deal (with automatic token refresh)
    /// </summary>
    public async Task<PipedriveNoteResponse> CreateNoteAsync(Session session, string content, int? personId = null, int? dealId = null)
    {
        if (personId == null && dealId == null)
        {
            throw new ArgumentException("Either personId or dealId must be provided");
        }

        if (personId != null && dealId != null)
        {
            throw new ArgumentException("Cannot provide both personId and dealId");
        }

        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => CreateNoteInternalAsync(accessToken, session.ApiDomain, content, personId, dealId),
            "CreateNote");
    }

    private async Task<PipedriveNoteResponse> CreateNoteInternalAsync(string accessToken, string apiDomain, string content, int? personId, int? dealId)
    {
        var url = $"{apiDomain}/api/v1/notes";

        if (personId != null)
        {
            logger.LogInformation("Creating note: personId={PersonId}, contentLength={Length}", personId, content.Length);
        }
        else
        {
            logger.LogInformation("Creating note: dealId={DealId}, contentLength={Length}", dealId, content.Length);
        }

        var request = new PipedriveCreateNoteRequest
        {
            Content = content,
            PersonId = personId,
            DealId = dealId
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" },
            { "Content-Type", "application/json" }
        };
        apiLogger.LogRequest("POST", url, headers, json);

        var response = await httpClient.SendAsync(httpRequest);
        var responseContent = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("POST", url, (int)response.StatusCode, responseContent);

        if (response.StatusCode == (HttpStatusCode)429)
        {
            logger.LogWarning("Pipedrive rate limit exceeded - Status: 429");
            throw new PipedriveRateLimitException("Pipedrive rate limit exceeded");
        }

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive create note failed: {response.StatusCode}");
            await HandleErrorResponse(response, responseContent);
        }

        var result = JsonSerializer.Deserialize<PipedriveNoteResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null || !result.Success)
        {
            logger.LogError("Failed to create note in Pipedrive - Success: false");
            throw new PipedriveApiException("Failed to create note in Pipedrive");
        }

        logger.LogInformation("Note created successfully: id={NoteId}", result.Data?.Id);

        return result;
    }

    /// <summary>
    /// Get all deals for a person (with automatic token refresh)
    /// </summary>
    public async Task<PipedriveDealsResponse> GetPersonDealsAsync(Session session, int personId)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => GetPersonDealsInternalAsync(accessToken, session.ApiDomain, personId),
            "GetPersonDeals");
    }

    private async Task<PipedriveDealsResponse> GetPersonDealsInternalAsync(string accessToken, string apiDomain, int personId)
    {
        var url = $"{apiDomain}/api/v2/deals?person_id={personId}&status=open,won,lost";
        logger.LogInformation("Getting deals for person: id={PersonId}", personId);

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" }
        };
        apiLogger.LogRequest("GET", url, headers, null);

        var response = await httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("GET", url, (int)response.StatusCode, content);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive get deals failed: {response.StatusCode}");
            await HandleErrorResponse(response, content);
        }

        var result = JsonSerializer.Deserialize<PipedriveDealsResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null)
        {
            logger.LogError("Failed to deserialize Pipedrive deals response");
            throw new PipedriveApiException("Invalid response from Pipedrive API - deserialization failed");
        }

        return result;
    }

    /// <summary>
    /// Get all stages (with automatic token refresh)
    /// </summary>
    public async Task<PipedriveStagesResponse> GetStagesAsync(Session session)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => GetStagesInternalAsync(accessToken, session.ApiDomain),
            "GetStages");
    }

    private async Task<PipedriveStagesResponse> GetStagesInternalAsync(string accessToken, string apiDomain)
    {
        var url = $"{apiDomain}/api/v1/stages";
        logger.LogInformation("Getting all stages");

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" }
        };
        apiLogger.LogRequest("GET", url, headers, null);

        var response = await httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("GET", url, (int)response.StatusCode, content);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive get stages failed: {response.StatusCode}");
            await HandleErrorResponse(response, content);
        }

        var result = JsonSerializer.Deserialize<PipedriveStagesResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null)
        {
            logger.LogError("Failed to deserialize Pipedrive stages response");
            throw new PipedriveApiException("Invalid response from Pipedrive API - deserialization failed");
        }

        return result;
    }

    /// <summary>
    /// Get all pipelines (with automatic token refresh)
    /// </summary>
    public async Task<PipedrivePipelinesResponse> GetPipelinesAsync(Session session)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => GetPipelinesInternalAsync(accessToken, session.ApiDomain),
            "GetPipelines");
    }

    private async Task<PipedrivePipelinesResponse> GetPipelinesInternalAsync(string accessToken, string apiDomain)
    {
        var url = $"{apiDomain}/api/v1/pipelines";
        logger.LogInformation("Getting all pipelines");

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" }
        };
        apiLogger.LogRequest("GET", url, headers, null);

        var response = await httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("GET", url, (int)response.StatusCode, content);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive get pipelines failed: {response.StatusCode}");
            await HandleErrorResponse(response, content);
        }

        var result = JsonSerializer.Deserialize<PipedrivePipelinesResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null)
        {
            logger.LogError("Failed to deserialize Pipedrive pipelines response");
            throw new PipedriveApiException("Invalid response from Pipedrive API - deserialization failed");
        }

        return result;
    }

    /// <summary>
    /// Create a new deal in Pipedrive (with automatic token refresh)
    /// </summary>
    public async Task<PipedriveDealResponse> CreateDealAsync(Session session, PipedriveCreateDealRequest request)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => CreateDealInternalAsync(accessToken, session.ApiDomain, request),
            "CreateDeal");
    }

    private async Task<PipedriveDealResponse> CreateDealInternalAsync(string accessToken, string apiDomain, PipedriveCreateDealRequest request)
    {
        var url = $"{apiDomain}/api/v1/deals";
        logger.LogInformation("Creating deal: title={Title}, personId={PersonId}, pipelineId={PipelineId}, stageId={StageId}",
            request.Title, request.PersonId, request.PipelineId, request.StageId);

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        httpRequest.Headers.Add("Accept", "application/json");
        httpRequest.Content = new StringContent(
            JsonSerializer.Serialize(request),
            System.Text.Encoding.UTF8,
            "application/json");

        var json = JsonSerializer.Serialize(request);

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" },
            { "Content-Type", "application/json" }
        };
        apiLogger.LogRequest("POST", url, headers, json);

        var response = await httpClient.SendAsync(httpRequest);
        var responseContent = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("POST", url, (int)response.StatusCode, responseContent);

        if (response.StatusCode == (HttpStatusCode)429)
        {
            logger.LogWarning("Pipedrive rate limit exceeded - Status: 429");
            throw new PipedriveRateLimitException("Pipedrive rate limit exceeded");
        }

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive create deal failed: {response.StatusCode}");
            await HandleErrorResponse(response, responseContent);
        }

        var result = JsonSerializer.Deserialize<PipedriveDealResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result == null || !result.Success)
        {
            logger.LogError("Failed to create deal in Pipedrive - Success: false");
            throw new PipedriveApiException("Failed to create deal in Pipedrive");
        }

        logger.LogInformation("Deal created successfully: id={DealId}", result.Data?.Id);

        return result;
    }

    /// <summary>
    /// Update deal stage (and implicitly pipeline via stage's pipeline_id)
    /// </summary>
    public async Task<PipedriveDeal> UpdateDealAsync(Session session, int dealId, int stageId)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => UpdateDealInternalAsync(accessToken, session.ApiDomain, dealId, stageId),
            "UpdateDeal");
    }

    private async Task<PipedriveDeal> UpdateDealInternalAsync(string accessToken, string apiDomain, int dealId, int stageId)
    {
        var url = $"{apiDomain}/api/v1/deals/{dealId}";
        var body = new { stage_id = stageId };

        logger.LogInformation("Updating deal: dealId={DealId}, stageId={StageId}", dealId, stageId);

        var json = JsonSerializer.Serialize(body);

        var httpRequest = new HttpRequestMessage(HttpMethod.Put, url);
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        httpRequest.Headers.Add("Accept", "application/json");
        httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" },
            { "Content-Type", "application/json" }
        };
        apiLogger.LogRequest("PUT", url, headers, json);

        var response = await httpClient.SendAsync(httpRequest);
        var responseContent = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("PUT", url, (int)response.StatusCode, responseContent);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive update deal failed: {response.StatusCode}");
            await HandleErrorResponse(response, responseContent);
        }

        var result = JsonSerializer.Deserialize<PipedriveDealResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result?.Data == null)
        {
            logger.LogError("Failed to update deal in Pipedrive - no data returned");
            throw new PipedriveNotFoundException($"Deal {dealId} not found");
        }

        logger.LogInformation("Deal updated successfully: dealId={DealId}", dealId);

        return result.Data;
    }

    /// <summary>
    /// Mark deal as won or lost (with automatic token refresh)
    /// </summary>
    public async Task<PipedriveDeal> MarkDealWonLostAsync(Session session, int dealId, string status, string? lostReason)
    {
        return await ExecuteWithRefreshAsync(
            session,
            (accessToken) => MarkDealWonLostInternalAsync(accessToken, session.ApiDomain, dealId, status, lostReason),
            "MarkDealWonLost");
    }

    private async Task<PipedriveDeal> MarkDealWonLostInternalAsync(string accessToken, string apiDomain, int dealId, string status, string? lostReason)
    {
        var url = $"{apiDomain}/api/v1/deals/{dealId}";

        // Build request body based on status
        object body;
        if (status == "lost" && !string.IsNullOrEmpty(lostReason))
        {
            body = new { status = status, lost_reason = lostReason };
        }
        else
        {
            body = new { status = status };
        }

        logger.LogInformation("Marking deal as {Status}: dealId={DealId}, lostReason={LostReason}",
            status, dealId, lostReason ?? "N/A");

        var json = JsonSerializer.Serialize(body);

        var httpRequest = new HttpRequestMessage(HttpMethod.Put, url);
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        httpRequest.Headers.Add("Accept", "application/json");
        httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");

        // Log request (sanitize access token)
        var headers = new Dictionary<string, string>
        {
            { "Authorization", "Bearer [REDACTED]" },
            { "Content-Type", "application/json" }
        };
        apiLogger.LogRequest("PUT", url, headers, json);

        var response = await httpClient.SendAsync(httpRequest);
        var responseContent = await response.Content.ReadAsStringAsync();

        // Log response
        apiLogger.LogResponse("PUT", url, (int)response.StatusCode, responseContent);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning($"Pipedrive mark deal won/lost failed: {response.StatusCode}");
            await HandleErrorResponse(response, responseContent);
        }

        var result = JsonSerializer.Deserialize<PipedriveDealResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (result?.Data == null)
        {
            logger.LogError("Failed to mark deal as {Status} in Pipedrive - no data returned", status);
            throw new PipedriveNotFoundException($"Deal {dealId} not found");
        }

        logger.LogInformation("Deal marked as {Status} successfully: dealId={DealId}", status, dealId);

        return result.Data;
    }

    /// <summary>
    /// Handle error responses from Pipedrive API
    /// </summary>
    private Task HandleErrorResponse(HttpResponseMessage response, string content)
    {
        logger.LogError($"Pipedrive API error: {response.StatusCode} - {content}");

        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            throw new PipedriveUnauthorizedException("Pipedrive access token is invalid or expired");
        }

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new PipedriveNotFoundException("Resource not found");
        }

        if (response.StatusCode == (HttpStatusCode)429)
        {
            throw new PipedriveRateLimitException("Pipedrive rate limit exceeded");
        }

        throw new PipedriveApiException($"Pipedrive API error: {response.StatusCode}");
    }

    /// <summary>
    /// Execute Pipedrive API call with automatic token refresh on 401 errors
    /// </summary>
    private async Task<T> ExecuteWithRefreshAsync<T>(
        Session session,
        Func<string, Task<T>> apiCall,
        string operationName)
    {
        try
        {
            // First attempt with current access token
            logger.LogDebug("[{Operation}] Executing API call with current token", operationName);
            return await apiCall(session.AccessToken);
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning("[{Operation}] Access token invalid or expired (401), attempting refresh", operationName);

            try
            {
                // Refresh the access token
                logger.LogInformation("[{Operation}] Calling OAuth service to refresh token", operationName);
                var tokenResponse = await oauthService.RefreshAccessTokenAsync(session.RefreshToken);
                logger.LogInformation("[{Operation}] Token refresh successful, expires in {ExpiresIn} seconds",
                    operationName, tokenResponse.ExpiresIn);

                // Update session with new tokens
                session.AccessToken = tokenResponse.AccessToken;
                session.RefreshToken = tokenResponse.RefreshToken;
                session.ExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);

                logger.LogInformation("[{Operation}] Updating session in database", operationName);
                await sessionService.UpdateSessionAsync(session);
                logger.LogInformation("[{Operation}] Session updated with new tokens", operationName);

                // Retry API call with new access token
                logger.LogInformation("[{Operation}] Retrying API call with refreshed token", operationName);
                return await apiCall(session.AccessToken);
            }
            catch (HttpRequestException refreshEx) when (refreshEx.Message.Contains("401") || refreshEx.Message.Contains("403"))
            {
                // Refresh token is also expired (60 days)
                logger.LogError(refreshEx, "[{Operation}] Refresh token expired - session_expired", operationName);

                // Delete expired session
                try
                {
                    await sessionService.DeleteSessionAsync(session.VerificationCode);
                    logger.LogInformation("[{Operation}] Deleted expired session from database", operationName);
                }
                catch (Exception deleteEx)
                {
                    logger.LogWarning(deleteEx, "[{Operation}] Failed to delete expired session", operationName);
                }

                // Throw to trigger re-authentication
                throw new PipedriveUnauthorizedException("Refresh token expired - session_expired");
            }
            catch (Exception refreshEx)
            {
                logger.LogError(refreshEx, "[{Operation}] Token refresh failed: {Message}",
                    operationName, refreshEx.Message);
                // Re-throw original 401 exception if refresh fails for other reasons
                throw ex;
            }
        }
    }
}

/// <summary>
/// Exception thrown when Pipedrive returns 404 Not Found
/// </summary>
public class PipedriveNotFoundException : Exception
{
    public PipedriveNotFoundException(string message) : base(message) { }
}

/// <summary>
/// Exception thrown when Pipedrive returns 401 Unauthorized
/// </summary>
public class PipedriveUnauthorizedException : Exception
{
    public PipedriveUnauthorizedException(string message) : base(message) { }
}

/// <summary>
/// Exception thrown when Pipedrive returns 429 Too Many Requests
/// </summary>
public class PipedriveRateLimitException : Exception
{
    public PipedriveRateLimitException(string message) : base(message) { }
}

/// <summary>
/// General exception for Pipedrive API errors
/// </summary>
public class PipedriveApiException : Exception
{
    public PipedriveApiException(string message) : base(message) { }
}
