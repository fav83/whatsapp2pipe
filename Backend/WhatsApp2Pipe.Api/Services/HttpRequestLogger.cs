using System.Diagnostics;
using System.Text;
using System.Text.Json;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace WhatsApp2Pipe.Api.Services;

public class HttpRequestLogger
{
    private readonly TelemetryClient telemetryClient;
    private readonly ILogger<HttpRequestLogger> logger;
    private const int MaxBodySizeBytes = 1_048_576; // 1MB

    public HttpRequestLogger(
        TelemetryClient telemetryClient,
        ILogger<HttpRequestLogger> logger)
    {
        this.telemetryClient = telemetryClient;
        this.logger = logger;
    }

    public async Task LogRequestAsync(HttpRequestData req)
    {
        try
        {
            // Read request body
            string bodyContent;
            if (req.Body.CanSeek)
            {
                var originalPosition = req.Body.Position;
                req.Body.Position = 0;

                using var reader = new StreamReader(req.Body, Encoding.UTF8, leaveOpen: true);
                bodyContent = await reader.ReadToEndAsync();

                // Check if body exceeds size limit
                var bodyBytes = Encoding.UTF8.GetByteCount(bodyContent);
                if (bodyBytes > MaxBodySizeBytes)
                {
                    var originalSizeMB = bodyBytes / 1_048_576.0;
                    bodyContent = bodyContent.Substring(0, MaxBodySizeBytes);
                    bodyContent += $"\n[TRUNCATED - Original size: {originalSizeMB:F2} MB]";
                }

                // Reset stream position for function to read
                req.Body.Position = originalPosition;
            }
            else
            {
                bodyContent = "[Body not logged - stream not seekable]";
            }

            // Collect headers
            var headersDict = new Dictionary<string, string>();
            foreach (var header in req.Headers)
            {
                headersDict[header.Key] = string.Join(", ", header.Value);
            }
            var headersJson = JsonSerializer.Serialize(headersDict);

            // Create telemetry event
            var eventTelemetry = new EventTelemetry("HttpRequest");
            eventTelemetry.Properties["Method"] = req.Method;
            eventTelemetry.Properties["Url"] = req.Url.ToString();
            eventTelemetry.Properties["Headers"] = headersJson;
            eventTelemetry.Properties["Body"] = bodyContent;
            eventTelemetry.Properties["Timestamp"] = DateTime.UtcNow.ToString("o");

            // Preserve operation ID for correlation
            var activity = Activity.Current;
            if (activity != null)
            {
                eventTelemetry.Context.Operation.Id = activity.RootId;
                eventTelemetry.Context.Operation.ParentId = activity.ParentId;
            }

            // Send telemetry
            telemetryClient.TrackEvent(eventTelemetry);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP request - this error is swallowed to prevent impact on function execution");
        }
    }

    /// <summary>
    /// Log HTTP response with status code only (for simple responses)
    /// </summary>
    public void LogResponse(string functionName, int statusCode)
    {
        try
        {
            logger.LogInformation(
                "[HTTP Response] Function: {FunctionName}, Status: {StatusCode}, Body: None",
                functionName,
                statusCode
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP response");
        }
    }

    /// <summary>
    /// Log HTTP response with JSON object body
    /// </summary>
    public void LogResponse(string functionName, int statusCode, object responseData)
    {
        try
        {
            var bodyJson = JsonSerializer.Serialize(responseData);
            logger.LogInformation(
                "[HTTP Response] Function: {FunctionName}, Status: {StatusCode}, Body: {Body}",
                functionName,
                statusCode,
                bodyJson
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP response");
        }
    }

    /// <summary>
    /// Log HTTP response with pre-serialized string body
    /// </summary>
    public void LogResponse(string functionName, int statusCode, string responseBody)
    {
        try
        {
            logger.LogInformation(
                "[HTTP Response] Function: {FunctionName}, Status: {StatusCode}, Body: {Body}",
                functionName,
                statusCode,
                responseBody
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP response");
        }
    }

    /// <summary>
    /// Log HTTP response with full details (status, headers, body)
    /// </summary>
    public void LogResponse(string functionName, int statusCode, Dictionary<string, string>? headers, object? responseData)
    {
        try
        {
            var headersJson = headers != null ? JsonSerializer.Serialize(headers) : "None";
            var bodyJson = responseData != null ? JsonSerializer.Serialize(responseData) : "None";

            logger.LogInformation(
                "[HTTP Response] Function: {FunctionName}, Status: {StatusCode}, Headers: {Headers}, Body: {Body}",
                functionName,
                statusCode,
                headersJson,
                bodyJson
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP response");
        }
    }
}
