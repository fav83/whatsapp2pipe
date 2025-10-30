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
    private readonly ITableStorageService tableStorageService;

    public PipedriveApiClient(
        HttpClient httpClient,
        PipedriveSettings config,
        ILogger<PipedriveApiClient> logger,
        IOAuthService oauthService,
        ITableStorageService tableStorageService)
    {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
        this.apiLogger = new PipedriveApiLogger(logger);
        this.oauthService = oauthService;
        this.tableStorageService = tableStorageService;
    }

    /// <summary>
    /// Search for persons by term and fields (with automatic token refresh)
    /// </summary>
    public async Task<PipedriveSearchResponse> SearchPersonsAsync(SessionEntity session, string term, string fields)
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

        return result ?? new PipedriveSearchResponse { Success = false };
    }

    /// <summary>
    /// Create a new person in Pipedrive (with automatic token refresh)
    /// </summary>
    public async Task<PipedrivePersonResponse> CreatePersonAsync(SessionEntity session, PipedriveCreatePersonRequest request)
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

        return result ?? new PipedrivePersonResponse { Success = false };
    }

    /// <summary>
    /// Get an existing person by ID (with automatic token refresh)
    /// </summary>
    public async Task<PipedrivePersonResponse> GetPersonAsync(SessionEntity session, int personId)
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

        return result ?? new PipedrivePersonResponse { Success = false };
    }

    /// <summary>
    /// Update an existing person (with automatic token refresh)
    /// </summary>
    public async Task<PipedrivePersonResponse> UpdatePersonAsync(SessionEntity session, int personId, PipedriveUpdatePersonRequest request)
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

        return result ?? new PipedrivePersonResponse { Success = false };
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
        SessionEntity session,
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
                session.SessionExpiresAt = DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresIn);

                logger.LogInformation("[{Operation}] Updating session in table storage", operationName);
                await tableStorageService.UpdateSessionAsync(session);
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
                    await tableStorageService.DeleteSessionAsync(session.PartitionKey);
                    logger.LogInformation("[{Operation}] Deleted expired session from table storage", operationName);
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
