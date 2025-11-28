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

    #region UpdateDealAsync Tests

    [Fact]
    public async Task UpdateDealAsync_ValidResponse_ReturnsUpdatedDeal()
    {
        // Arrange
        var session = CreateTestSession();
        var dealId = 123;
        var stageId = 5;

        var dealResponse = new PipedriveDealResponse
        {
            Success = true,
            Data = new PipedriveDeal
            {
                Id = dealId,
                Title = "Test Deal",
                StageId = stageId,
                Status = "open"
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(dealResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.UpdateDealAsync(session, dealId, stageId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dealId, result.Id);
        Assert.Equal(stageId, result.StageId);
        Assert.Equal("open", result.Status);
    }

    [Fact]
    public async Task UpdateDealAsync_NotFound_ThrowsPipedriveNotFoundException()
    {
        // Arrange
        var session = CreateTestSession();
        var dealId = 999;
        var stageId = 5;

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.NotFound,
            "{\"success\":false,\"error\":\"Deal not found\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveNotFoundException>(
            async () => await client.UpdateDealAsync(session, dealId, stageId)
        );
    }

    [Fact]
    public async Task UpdateDealAsync_UnauthorizedError_ThrowsPipedriveUnauthorizedException()
    {
        // Arrange
        var session = CreateTestSession();
        var dealId = 123;
        var stageId = 5;

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Unauthorized,
            "{\"success\":false,\"error\":\"Unauthorized\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveUnauthorizedException>(
            async () => await client.UpdateDealAsync(session, dealId, stageId)
        );
    }

    #endregion

    #region MarkDealWonLostAsync Tests

    [Fact]
    public async Task MarkDealWonLostAsync_WonStatus_ReturnsUpdatedDeal()
    {
        // Arrange
        var session = CreateTestSession();
        var dealId = 456;
        var status = "won";

        var dealResponse = new PipedriveDealResponse
        {
            Success = true,
            Data = new PipedriveDeal
            {
                Id = dealId,
                Title = "Won Deal",
                Value = 50000,
                Currency = "USD",
                StageId = 5,
                Status = "won",
                UpdateTime = "2025-01-20 15:30:00"
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(dealResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.MarkDealWonLostAsync(session, dealId, status, null);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dealId, result.Id);
        Assert.Equal("Won Deal", result.Title);
        Assert.Equal("won", result.Status);
        Assert.Null(result.LostReason);
    }

    [Fact]
    public async Task MarkDealWonLostAsync_LostStatusWithReason_ReturnsUpdatedDeal()
    {
        // Arrange
        var session = CreateTestSession();
        var dealId = 456;
        var status = "lost";
        var lostReason = "Customer chose competitor";

        var dealResponse = new PipedriveDealResponse
        {
            Success = true,
            Data = new PipedriveDeal
            {
                Id = dealId,
                Title = "Lost Deal",
                Value = 50000,
                Currency = "USD",
                StageId = 5,
                Status = "lost",
                LostReason = lostReason,
                UpdateTime = "2025-01-20 15:30:00"
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(dealResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.MarkDealWonLostAsync(session, dealId, status, lostReason);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dealId, result.Id);
        Assert.Equal("Lost Deal", result.Title);
        Assert.Equal("lost", result.Status);
        Assert.Equal(lostReason, result.LostReason);
    }

    [Fact]
    public async Task MarkDealWonLostAsync_DealNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var session = CreateTestSession();
        var dealId = 999;
        var status = "won";

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.NotFound,
            "{\"success\":false,\"error\":\"Deal not found\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveNotFoundException>(
            async () => await client.MarkDealWonLostAsync(session, dealId, status, null)
        );
    }

    [Fact]
    public async Task MarkDealWonLostAsync_UnauthorizedResponse_ThrowsUnauthorizedException()
    {
        // Arrange
        var session = CreateTestSession();
        var dealId = 456;
        var status = "won";

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Unauthorized,
            "{\"success\":false,\"error\":\"Unauthorized\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveUnauthorizedException>(
            async () => await client.MarkDealWonLostAsync(session, dealId, status, null)
        );
    }

    #endregion

    #region CreateNoteAsync Tests

    [Fact]
    public async Task CreateNoteAsync_WithPersonId_CreatesNoteSuccessfully()
    {
        // Arrange
        var session = CreateTestSession();
        var content = "Test note content";
        var personId = 123;

        var noteResponse = new PipedriveNoteResponse
        {
            Success = true,
            Data = new PipedriveNote
            {
                Id = 456,
                Content = content,
                PersonId = personId
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Created,
            JsonSerializer.Serialize(noteResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.CreateNoteAsync(session, content, personId: personId);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(456, result.Data.Id);
        Assert.Equal(content, result.Data.Content);
        Assert.Equal(personId, result.Data.PersonId);
    }

    [Fact]
    public async Task CreateNoteAsync_WithDealId_CreatesNoteSuccessfully()
    {
        // Arrange
        var session = CreateTestSession();
        var content = "Deal note content";
        var dealId = 789;

        var noteResponse = new PipedriveNoteResponse
        {
            Success = true,
            Data = new PipedriveNote
            {
                Id = 456,
                Content = content
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Created,
            JsonSerializer.Serialize(noteResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.CreateNoteAsync(session, content, dealId: dealId);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(456, result.Data.Id);
        Assert.Equal(content, result.Data.Content);
    }

    [Fact]
    public async Task CreateNoteAsync_WithNeitherPersonIdNorDealId_ThrowsArgumentException()
    {
        // Arrange
        var session = CreateTestSession();
        var content = "Test content";

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(HttpStatusCode.OK, "{}");
        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            async () => await client.CreateNoteAsync(session, content, personId: null, dealId: null)
        );
    }

    [Fact]
    public async Task CreateNoteAsync_WithBothPersonIdAndDealId_ThrowsArgumentException()
    {
        // Arrange
        var session = CreateTestSession();
        var content = "Test content";

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(HttpStatusCode.OK, "{}");
        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            async () => await client.CreateNoteAsync(session, content, personId: 123, dealId: 789)
        );
    }

    [Fact]
    public async Task CreateNoteAsync_WithLongContent_CreatesNoteSuccessfully()
    {
        // Arrange
        var session = CreateTestSession();
        var longContent = new string('A', 10000);
        var personId = 123;

        var noteResponse = new PipedriveNoteResponse
        {
            Success = true,
            Data = new PipedriveNote
            {
                Id = 456,
                Content = longContent,
                PersonId = personId
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Created,
            JsonSerializer.Serialize(noteResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.CreateNoteAsync(session, longContent, personId: personId);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(longContent, result.Data.Content);
    }

    [Fact]
    public async Task CreateNoteAsync_WithUnauthorizedResponse_ThrowsPipedriveUnauthorizedException()
    {
        // Arrange
        var session = CreateTestSession();
        var content = "Test content";
        var personId = 123;

        // Mock the first unauthorized response
        var mockHandler = new Mock<HttpMessageHandler>();
        mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.Unauthorized,
                Content = new StringContent("{}", Encoding.UTF8, "application/json")
            });

        var httpClient = new HttpClient(mockHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };

        // Mock token refresh failure
        mockOAuthService.Setup(o => o.RefreshAccessTokenAsync(It.IsAny<string>()))
            .ThrowsAsync(new PipedriveUnauthorizedException("Refresh token expired"));

        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveUnauthorizedException>(
            async () => await client.CreateNoteAsync(session, content, personId: personId)
        );
    }

    [Fact]
    public async Task CreateNoteAsync_WithRateLimitResponse_ThrowsPipedriveRateLimitException()
    {
        // Arrange
        var session = CreateTestSession();
        var content = "Test content";
        var personId = 123;

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            (HttpStatusCode)429,
            "{}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveRateLimitException>(
            async () => await client.CreateNoteAsync(session, content, personId: personId)
        );
    }

    [Fact]
    public async Task CreateNoteAsync_WithNotFoundResponse_ThrowsPipedriveNotFoundException()
    {
        // Arrange
        var session = CreateTestSession();
        var content = "Test content";
        var personId = 999;

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.NotFound,
            "{}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveNotFoundException>(
            async () => await client.CreateNoteAsync(session, content, personId: personId)
        );
    }

    [Fact]
    public async Task CreateNoteAsync_WithServerError_ThrowsPipedriveApiException()
    {
        // Arrange
        var session = CreateTestSession();
        var content = "Test content";
        var personId = 123;

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.InternalServerError,
            "{}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveApiException>(
            async () => await client.CreateNoteAsync(session, content, personId: personId)
        );
    }

    [Fact]
    public async Task CreateNoteAsync_WithSpecialCharacters_CreatesNoteSuccessfully()
    {
        // Arrange
        var session = CreateTestSession();
        var specialContent = "Test & <script>alert('XSS')</script> \"quotes\" and 'apostrophes' with newlines\nand tabs\t";
        var personId = 123;

        var noteResponse = new PipedriveNoteResponse
        {
            Success = true,
            Data = new PipedriveNote
            {
                Id = 456,
                Content = specialContent,
                PersonId = personId
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Created,
            JsonSerializer.Serialize(noteResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object)
        {
            BaseAddress = new Uri("https://api.pipedrive.com")
        };
        var client = new PipedriveApiClient(
            httpClient, config, mockLogger.Object, mockOAuthService.Object, mockSessionService.Object);

        // Act
        var result = await client.CreateNoteAsync(session, specialContent, personId: personId);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(specialContent, result.Data.Content);
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
