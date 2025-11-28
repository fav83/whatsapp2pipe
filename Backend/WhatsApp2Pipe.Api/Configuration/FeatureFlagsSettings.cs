namespace WhatsApp2Pipe.Api.Configuration;

/// <summary>
/// Configuration class for feature flags.
/// Binds to app settings with FeatureFlags__ prefix.
/// </summary>
public class FeatureFlagsSettings
{
    /// <summary>
    /// Controls visibility of all deal-related functionality in the extension.
    /// When false, deal UI is completely hidden from users.
    /// Defaults to false - must be explicitly enabled in App Settings.
    /// </summary>
    public bool EnableDeals { get; set; } = false;

    // Future flags added here as properties
}
