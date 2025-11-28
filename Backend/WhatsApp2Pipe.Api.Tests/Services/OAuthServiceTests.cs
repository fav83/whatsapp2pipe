using AutoFixture;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Tests.Services;

public class OAuthServiceTests
{
    private readonly Mock<ILogger<OAuthService>> mockLogger;
    private readonly Fixture fixture;
    private readonly PipedriveSettings settings;

    public OAuthServiceTests()
    {
        mockLogger = new Mock<ILogger<OAuthService>>();
        fixture = new Fixture();

        // Configure test settings
        settings = new PipedriveSettings
        {
            ClientId = "test-client-id",
            ClientSecret = "test-client-secret",
            RedirectUri = "https://test.azurewebsites.net/api/auth/callback",
            AuthorizationEndpoint = "https://oauth.pipedrive.com/oauth/authorize",
            TokenEndpoint = "https://oauth.pipedrive.com/oauth/token"
        };
    }

    private static IOptions<FeatureFlagsSettings> CreateFeatureFlagsOptions(bool enableDeals)
    {
        return Options.Create(new FeatureFlagsSettings { EnableDeals = enableDeals });
    }

    #region BuildAuthorizationUrl Tests

    [Fact]
    public void BuildAuthorizationUrl_ValidState_ReturnsCorrectUrl()
    {
        // Arrange
        var featureFlags = CreateFeatureFlagsOptions(enableDeals: false);
        var service = new OAuthService(settings, featureFlags, mockLogger.Object);
        var state = "test-state-value";

        // Act
        var url = service.BuildAuthorizationUrl(state);

        // Assert
        Assert.NotNull(url);
        Assert.Contains("https://oauth.pipedrive.com/oauth/authorize", url);
        Assert.Contains("client_id=test-client-id", url);
        Assert.Contains("redirect_uri=https%3A%2F%2Ftest.azurewebsites.net%2Fapi%2Fauth%2Fcallback", url);
        Assert.Contains("state=test-state-value", url);
        Assert.Contains("response_type=code", url);
    }

    [Fact]
    public void BuildAuthorizationUrl_StateWithSpecialCharacters_UrlEncodesState()
    {
        // Arrange
        var featureFlags = CreateFeatureFlagsOptions(enableDeals: false);
        var service = new OAuthService(settings, featureFlags, mockLogger.Object);
        var state = "state+with/special=chars&more";

        // Act
        var url = service.BuildAuthorizationUrl(state);

        // Assert
        Assert.Contains("state=state%2Bwith%2Fspecial%3Dchars%26more", url);
    }

    [Fact]
    public void BuildAuthorizationUrl_IncludesAllRequiredParameters()
    {
        // Arrange
        var featureFlags = CreateFeatureFlagsOptions(enableDeals: false);
        var service = new OAuthService(settings, featureFlags, mockLogger.Object);
        var state = fixture.Create<string>();

        // Act
        var url = service.BuildAuthorizationUrl(state);

        // Assert
        var uri = new Uri(url);
        var query = QueryHelpers.ParseQuery(uri.Query);

        Assert.Equal("test-client-id", query["client_id"]);
        Assert.Equal("https://test.azurewebsites.net/api/auth/callback", query["redirect_uri"]);
        Assert.Equal(state, query["state"]);
        Assert.Equal("code", query["response_type"]);
    }

    [Fact]
    public void BuildAuthorizationUrl_AlwaysIncludesContactsScope()
    {
        // Arrange
        var featureFlags = CreateFeatureFlagsOptions(enableDeals: false);
        var service = new OAuthService(settings, featureFlags, mockLogger.Object);
        var state = fixture.Create<string>();

        // Act
        var url = service.BuildAuthorizationUrl(state);

        // Assert
        Assert.Contains("scope=contacts%3Afull", url);
    }

    [Fact]
    public void BuildAuthorizationUrl_EmptyState_ReturnsUrlWithEmptyState()
    {
        // Arrange
        var featureFlags = CreateFeatureFlagsOptions(enableDeals: false);
        var service = new OAuthService(settings, featureFlags, mockLogger.Object);
        var state = string.Empty;

        // Act
        var url = service.BuildAuthorizationUrl(state);

        // Assert
        Assert.Contains("state=", url);
        Assert.Contains("client_id=", url);
    }

    [Fact]
    public void BuildAuthorizationUrl_MultipleCallsSameState_ReturnsSameUrl()
    {
        // Arrange
        var featureFlags = CreateFeatureFlagsOptions(enableDeals: false);
        var service = new OAuthService(settings, featureFlags, mockLogger.Object);
        var state = fixture.Create<string>();

        // Act
        var url1 = service.BuildAuthorizationUrl(state);
        var url2 = service.BuildAuthorizationUrl(state);

        // Assert
        Assert.Equal(url1, url2);
    }

    [Fact]
    public void BuildAuthorizationUrl_EnableDealsFalse_DoesNotIncludeDealsScope()
    {
        // Arrange
        var featureFlags = CreateFeatureFlagsOptions(enableDeals: false);
        var service = new OAuthService(settings, featureFlags, mockLogger.Object);
        var state = fixture.Create<string>();

        // Act
        var url = service.BuildAuthorizationUrl(state);

        // Assert
        Assert.Contains("scope=contacts%3Afull", url);
        Assert.DoesNotContain("deals", url);
    }

    [Fact]
    public void BuildAuthorizationUrl_EnableDealsTrue_IncludesDealsScope()
    {
        // Arrange
        var featureFlags = CreateFeatureFlagsOptions(enableDeals: true);
        var service = new OAuthService(settings, featureFlags, mockLogger.Object);
        var state = fixture.Create<string>();

        // Act
        var url = service.BuildAuthorizationUrl(state);

        // Assert
        // URL-encoded: contacts:full deals:full -> contacts%3Afull%20deals%3Afull
        Assert.Contains("scope=contacts%3Afull%20deals%3Afull", url);
    }

    #endregion

    #region HTTP Method Tests (Integration)

    // Note: ExchangeCodeForTokensAsync and RefreshAccessTokenAsync require HTTP mocking
    // which is difficult since OAuthService creates its own HttpClient.
    // These tests would require:
    // 1. Refactoring OAuthService to accept IHttpClientFactory/HttpClient via constructor, OR
    // 2. Integration tests against a mock OAuth server, OR
    // 3. Using advanced mocking libraries that can intercept HttpClient calls

    // For now, these methods should be tested via integration tests or by refactoring
    // the service to accept HttpClient as a dependency.

    #endregion
}
