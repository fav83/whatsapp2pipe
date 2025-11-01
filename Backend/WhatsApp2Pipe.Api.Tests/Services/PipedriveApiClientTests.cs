using System.Net;
using System.Text;
using System.Text.Json;
using AutoFixture;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Tests.Services;

public class PipedriveApiClientTests
{
    private readonly Mock<ILogger<PipedriveApiClient>> mockLogger;
    private readonly Mock<IOAuthService> mockOAuthService;
    private readonly Mock<ISessionService> mockSessionService;
    private readonly PipedriveSettings config;
    private readonly Fixture fixture;

    public PipedriveApiClientTests()
    {
        mockLogger = new Mock<ILogger<PipedriveApiClient>>();
        mockOAuthService = new Mock<IOAuthService>();
        mockSessionService = new Mock<ISessionService>();
        config = new PipedriveSettings
        {
            BaseUrl = "https://api.pipedrive.com",
            ApiVersion = "v1"
        };
        fixture = new Fixture();
        fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
            .ForEach(b => fixture.Behaviors.Remove(b));
        fixture.Behaviors.Add(new OmitOnRecursionBehavior());
    }

    #region SearchPersonsAsync Tests

    [Fact]
    public async Task SearchPersonsAsync_ValidResponse_ReturnsPersons()
    {
        // Arrange
        var session = CreateTestSession();
        var term = "+48123456789";
        var fields = "phone";

        var searchResponse = new PipedriveSearchResponse
        {
            Success = true,
            Data = new PipedriveSearchData
            {
                Items = new[]
                {
                    new PipedriveSearchItem
                    {
                        Item = new PipedrivePerson
                        {
                            Id = 123,
                            Name = "John Doe",
                            Phone = new List<PipedrivePhone>
                            {
                                new PipedrivePhone { Value = "+48123456789", Label = "mobile", Primary = true }
                            }
                        }
                    }
                }
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(searchResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.SearchPersonsAsync(session, term, fields);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data.Items);
        Assert.Equal(123, result.Data.Items[0].Item?.Id);
        Assert.Equal("John Doe", result.Data.Items[0].Item?.Name);
    }

    [Fact]
    public async Task SearchPersonsAsync_NoResults_ReturnsEmptyData()
    {
        // Arrange
        var session = CreateTestSession();
        var term = "+48999999999";
        var fields = "phone";

        var searchResponse = new PipedriveSearchResponse
        {
            Success = true,
            Data = new PipedriveSearchData
            {
                Items = Array.Empty<PipedriveSearchItem>()
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(searchResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.SearchPersonsAsync(session, term, fields);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Empty(result.Data.Items);
    }

    #endregion

    #region CreatePersonAsync Tests

    [Fact]
    public async Task CreatePersonAsync_ValidResponse_ReturnsPerson()
    {
        // Arrange
        var session = CreateTestSession();
        var request = new PipedriveCreatePersonRequest
        {
            Name = "New Person",
            Phone = new List<PipedrivePhoneInput>
            {
                new PipedrivePhoneInput { Value = "+48111222333", Label = "work", Primary = true }
            }
        };

        var personResponse = new PipedrivePersonResponse
        {
            Success = true,
            Data = new PipedrivePerson
            {
                Id = 456,
                Name = "New Person",
                Phone = new List<PipedrivePhone>
                {
                    new PipedrivePhone { Value = "+48111222333", Label = "work", Primary = true }
                }
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(personResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.CreatePersonAsync(session, request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(456, result.Data.Id);
        Assert.Equal("New Person", result.Data.Name);
    }

    #endregion

    #region GetCurrentUserAsync Tests

    [Fact]
    public async Task GetCurrentUserAsync_ValidResponse_ReturnsUser()
    {
        // Arrange
        var session = CreateTestSession();

        var userResponse = new PipedriveUserResponse
        {
            Success = true,
            Data = new PipedriveUserData
            {
                Id = 789,
                Name = "Test User",
                Email = "test@example.com",
                CompanyId = 100,
                CompanyName = "Test Company",
                CompanyDomain = "test.pipedrive.com"
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(userResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.GetCurrentUserAsync(session);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(789, result.Data.Id);
        Assert.Equal("Test User", result.Data.Name);
        Assert.Equal("test@example.com", result.Data.Email);
    }

    #endregion

    #region Helper Methods

    private Session CreateTestSession()
    {
        return new Session
        {
            SessionId = Guid.NewGuid(),
            VerificationCode = fixture.Create<string>(),
            UserId = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            AccessToken = fixture.Create<string>(),
            RefreshToken = fixture.Create<string>(),
            ApiDomain = "api.pipedrive.com",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            SessionExpiresAt = DateTime.UtcNow.AddDays(60),
            ExtensionId = fixture.Create<string>(),
            CreatedAt = DateTime.UtcNow
        };
    }

    private Mock<HttpMessageHandler> CreateMockHttpMessageHandler(
        HttpStatusCode statusCode,
        string content)
    {
        var mockHandler = new Mock<HttpMessageHandler>();

        mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(content, Encoding.UTF8, "application/json")
            });

        return mockHandler;
    }

    #endregion
}
