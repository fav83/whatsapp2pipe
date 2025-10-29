using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// Helper service for logging Pipedrive API calls with complete request/response details
/// </summary>
public class PipedriveApiLogger
{
    private readonly ILogger logger;

    public PipedriveApiLogger(ILogger logger)
    {
        this.logger = logger;
    }

    /// <summary>
    /// Log a Pipedrive API request with full details
    /// </summary>
    public void LogRequest(string method, string url, Dictionary<string, string>? headers, string? body)
    {
        logger.LogInformation(
            "[Pipedrive API Request] Method: {Method}, URL: {Url}, Headers: {Headers}, Body: {Body}",
            method,
            url,
            headers != null ? JsonSerializer.Serialize(headers) : "None",
            body ?? "None"
        );
    }

    /// <summary>
    /// Log a Pipedrive API response with full details
    /// </summary>
    public void LogResponse(string method, string url, int statusCode, string? body)
    {
        logger.LogInformation(
            "[Pipedrive API Response] Method: {Method}, URL: {Url}, Status: {StatusCode}, Body: {Body}",
            method,
            url,
            statusCode,
            body ?? "None"
        );
    }

    /// <summary>
    /// Log a Pipedrive API error with full details
    /// </summary>
    public void LogError(string method, string url, int statusCode, string? body, Exception? exception = null)
    {
        if (exception != null)
        {
            logger.LogError(
                exception,
                "[Pipedrive API Error] Method: {Method}, URL: {Url}, Status: {StatusCode}, Body: {Body}",
                method,
                url,
                statusCode,
                body ?? "None"
            );
        }
        else
        {
            logger.LogError(
                "[Pipedrive API Error] Method: {Method}, URL: {Url}, Status: {StatusCode}, Body: {Body}",
                method,
                url,
                statusCode,
                body ?? "None"
            );
        }
    }
}
