using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// Client for making authenticated requests to Pipedrive API
/// </summary>
public class PipedriveApiClient : IPipedriveApiClient
{
    private readonly HttpClient httpClient;
    private readonly PipedriveConfig config;
    private readonly ILogger<PipedriveApiClient> logger;
    private readonly PipedriveApiLogger apiLogger;

    public PipedriveApiClient(
        HttpClient httpClient,
        PipedriveConfig config,
        ILogger<PipedriveApiClient> logger)
    {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
        this.apiLogger = new PipedriveApiLogger(logger);
    }

    /// <summary>
    /// Search for persons by term and fields
    /// </summary>
    public async Task<PipedriveSearchResponse> SearchPersonsAsync(string accessToken, string term, string fields)
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
    /// Create a new person in Pipedrive
    /// </summary>
    public async Task<PipedrivePersonResponse> CreatePersonAsync(string accessToken, PipedriveCreatePersonRequest request)
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
    /// Get an existing person by ID
    /// </summary>
    public async Task<PipedrivePersonResponse> GetPersonAsync(string accessToken, int personId)
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
    /// Update an existing person
    /// </summary>
    public async Task<PipedrivePersonResponse> UpdatePersonAsync(string accessToken, int personId, PipedriveUpdatePersonRequest request)
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
