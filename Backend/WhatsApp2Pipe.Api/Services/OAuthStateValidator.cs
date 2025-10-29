using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

/// <summary>
/// Validates OAuth state parameters received from Chrome extension.
/// Provides CSRF protection and state integrity validation.
/// </summary>
public class OAuthStateValidator
{
    private readonly ILogger<OAuthStateValidator> logger;
    private const int MaxStateAgeMinutes = 5;

    // Chrome extension IDs are 32 characters, lowercase a-p
    private static readonly Regex ExtensionIdRegex = new Regex("^[a-p]{32}$", RegexOptions.Compiled);

    public OAuthStateValidator(ILogger<OAuthStateValidator> logger)
    {
        this.logger = logger;
    }

    /// <summary>
    /// Validates the state parameter format and contents.
    /// </summary>
    /// <param name="state">Base64-encoded state from extension</param>
    /// <returns>True if state is valid, false otherwise</returns>
    public virtual bool IsValidStateFormat(string state)
    {
        if (string.IsNullOrEmpty(state))
        {
            logger.LogWarning("State is null or empty");
            return false;
        }

        try
        {
            var decodedState = DecodeState(state);
            if (decodedState == null)
            {
                return false;
            }

            // Validate required fields
            if (string.IsNullOrEmpty(decodedState.ExtensionId))
            {
                logger.LogWarning("State missing extensionId");
                return false;
            }

            if (string.IsNullOrEmpty(decodedState.Nonce))
            {
                logger.LogWarning("State missing nonce");
                return false;
            }

            if (decodedState.Timestamp == 0)
            {
                logger.LogWarning("State missing timestamp");
                return false;
            }

            // Validate extension ID format
            if (!IsValidExtensionId(decodedState.ExtensionId))
            {
                logger.LogWarning("Invalid extension ID format: {ExtensionId}", decodedState.ExtensionId);
                return false;
            }

            // Validate timestamp freshness
            if (!IsStateTimestampValid(decodedState.Timestamp))
            {
                logger.LogWarning("State timestamp expired or invalid");
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error validating state format");
            return false;
        }
    }

    /// <summary>
    /// Decodes base64-encoded state parameter into OAuthState object.
    /// </summary>
    /// <param name="state">Base64-encoded state</param>
    /// <returns>Decoded OAuthState or null if decoding fails</returns>
    public virtual OAuthState? DecodeState(string state)
    {
        try
        {
            var bytes = Convert.FromBase64String(state);
            var json = Encoding.UTF8.GetString(bytes);
            return JsonSerializer.Deserialize<OAuthState>(json);
        }
        catch (FormatException ex)
        {
            logger.LogError(ex, "Invalid base64 format in state");
            return null;
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Invalid JSON format in state");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to decode state");
            return null;
        }
    }

    /// <summary>
    /// Validates that the extension ID matches Chrome extension ID format.
    /// Chrome extension IDs are 32 characters, lowercase a-p.
    /// </summary>
    /// <param name="extensionId">Extension ID to validate</param>
    /// <returns>True if valid extension ID format</returns>
    public bool IsValidExtensionId(string extensionId)
    {
        if (string.IsNullOrEmpty(extensionId))
        {
            return false;
        }

        return ExtensionIdRegex.IsMatch(extensionId);
    }

    /// <summary>
    /// Validates that the state timestamp is within acceptable range (5 minutes).
    /// Prevents replay attacks using old state parameters.
    /// </summary>
    /// <param name="timestamp">Unix timestamp in milliseconds</param>
    /// <returns>True if timestamp is valid and fresh</returns>
    public bool IsStateTimestampValid(long timestamp)
    {
        try
        {
            var stateTime = DateTimeOffset.FromUnixTimeMilliseconds(timestamp);
            var now = DateTimeOffset.UtcNow;
            var age = now - stateTime;

            // Reject states from the future (clock skew tolerance: 1 minute)
            if (age.TotalMinutes < -1)
            {
                logger.LogWarning("State timestamp is in the future: {StateTime}", stateTime);
                return false;
            }

            // Reject states older than MaxStateAgeMinutes
            if (age.TotalMinutes > MaxStateAgeMinutes)
            {
                logger.LogWarning("State timestamp expired: {StateTime}, age: {Age} minutes",
                    stateTime, age.TotalMinutes);
                return false;
            }

            return true;
        }
        catch (ArgumentOutOfRangeException ex)
        {
            logger.LogError(ex, "Invalid timestamp value: {Timestamp}", timestamp);
            return false;
        }
    }
}
