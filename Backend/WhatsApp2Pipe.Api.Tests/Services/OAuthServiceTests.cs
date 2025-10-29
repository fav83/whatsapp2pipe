using AutoFixture;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Tests.Services;

public class OAuthServiceTests
{
    private readonly Mock<ILogger<OAuthService>> mockLogger;
    private readonly OAuthService service;
    private readonly Fixture fixture;
    private readonly IConfiguration configuration;

    public OAuthServiceTests()
    {
        mockLogger = new Mock<ILogger<OAuthService>>();
        fixture = new Fixture();

        // Configure test settings
        var configData = new Dictionary<string, string>
        {
            {"Pipedrive:ClientId", "test-client-id"},
            {"Pipedrive:ClientSecret", "test-client-secret"},
            {"Pipedrive:RedirectUri", "https://test.azurewebsites.net/api/auth/callback"},
            {"Pipedrive:AuthorizationEndpoint", "https://oauth.pipedrive.com/oauth/authorize"},
            {"Pipedrive:TokenEndpoint", "https://oauth.pipedrive.com/oauth/token"},
            {"Pipedrive:Scope", ""}
        };

        configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData!)
            .Build();

        service = new OAuthService(configuration, mockLogger.Object);
    }

    #region BuildAuthorizationUrl Tests

    [Fact]
    public void BuildAuthorizationUrl_ValidState_ReturnsCorrectUrl()
    {
        // Arrange
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
    public void BuildAuthorizationUrl_WithScope_IncludesScope()
    {
        // Arrange
        var configDataWithScope = new Dictionary<string, string>
        {
            {"Pipedrive:ClientId", "test-client-id"},
            {"Pipedrive:ClientSecret", "test-client-secret"},
            {"Pipedrive:RedirectUri", "https://test.azurewebsites.net/api/auth/callback"},
            {"Pipedrive:AuthorizationEndpoint", "https://oauth.pipedrive.com/oauth/authorize"},
            {"Pipedrive:TokenEndpoint", "https://oauth.pipedrive.com/oauth/token"},
            {"Pipedrive:Scope", "read write"}
        };

        var configWithScope = new ConfigurationBuilder()
            .AddInMemoryCollection(configDataWithScope!)
            .Build();

        var serviceWithScope = new OAuthService(configWithScope, mockLogger.Object);
        var state = fixture.Create<string>();

        // Act
        var url = serviceWithScope.BuildAuthorizationUrl(state);

        // Assert
        Assert.Contains("scope=read%20write", url);
    }

    [Fact]
    public void BuildAuthorizationUrl_WithoutScope_DoesNotIncludeScope()
    {
        // Arrange
        var state = fixture.Create<string>();

        // Act
        var url = service.BuildAuthorizationUrl(state);

        // Assert
        Assert.DoesNotContain("scope=", url);
    }

    [Fact]
    public void BuildAuthorizationUrl_EmptyState_ReturnsUrlWithEmptyState()
    {
        // Arrange
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
        var state = fixture.Create<string>();

        // Act
        var url1 = service.BuildAuthorizationUrl(state);
        var url2 = service.BuildAuthorizationUrl(state);

        // Assert
        Assert.Equal(url1, url2);
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
