namespace WhatsApp2Pipe.Api.Constants;

/// <summary>
/// OAuth and authentication error codes.
/// Standardized error codes shared across the application (backend, extension, website).
///
/// IMPORTANT: Keep these in sync with frontend error codes (Extension/src/types/errors.ts).
/// </summary>
public static class OAuthErrorCode
{
    /// <summary>User denied OAuth authorization</summary>
    public const string AccessDenied = "access_denied";

    /// <summary>Missing authorization code in callback</summary>
    public const string MissingCode = "missing_code";

    /// <summary>Missing or invalid state parameter</summary>
    public const string MissingState = "missing_state";

    /// <summary>Invalid or expired state parameter</summary>
    public const string InvalidState = "invalid_state";

    /// <summary>Failed to exchange authorization code for tokens</summary>
    public const string TokenExchangeFailed = "token_exchange_failed";

    /// <summary>Failed to fetch user profile from Pipedrive</summary>
    public const string UserProfileFetchFailed = "user_profile_fetch_failed";

    /// <summary>Failed to create user record in database</summary>
    public const string UserCreationFailed = "user_creation_failed";

    /// <summary>Server configuration error</summary>
    public const string ConfigError = "config_error";

    /// <summary>Internal server error</summary>
    public const string InternalError = "internal_error";

    /// <summary>Closed beta - no invite code provided</summary>
    public const string ClosedBeta = "closed_beta";

    /// <summary>Invalid invite code</summary>
    public const string InvalidInvite = "invalid_invite";

    /// <summary>Beta access required - extension user not in database</summary>
    public const string BetaAccessRequired = "beta_access_required";
}
