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
    private readonly PipedriveSettings config;
    private readonly Fixture fixture;

    public PipedriveApiClientTests()
    {
        mockLogger = new Mock<ILogger<PipedriveApiClient>>();
        config = new PipedriveSettings
        {
            BaseUrl = "https://api.pipedrive.com",
            ApiVersion = "v1"
        };
        fixture = new Fixture();
    }

    #region SearchPersonsAsync Tests

    [Fact]
    public async Task SearchPersonsAsync_ValidResponse_ReturnsPersons()
    {
        // Arrange
        var accessToken = fixture.Create<string>();
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

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act
        var result = await client.SearchPersonsAsync(accessToken, term, fields);

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
        var accessToken = fixture.Create<string>();
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

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act
        var result = await client.SearchPersonsAsync(accessToken, term, fields);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Empty(result.Data.Items);
    }

    [Fact]
    public async Task SearchPersonsAsync_Unauthorized_ThrowsException()
    {
        // Arrange
        var accessToken = "invalid-token";
        var term = "+48123456789";
        var fields = "phone";

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Unauthorized,
            "{\"error\":\"Unauthorized\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveUnauthorizedException>(
            () => client.SearchPersonsAsync(accessToken, term, fields)
        );
    }

    #endregion

    #region CreatePersonAsync Tests

    [Fact]
    public async Task CreatePersonAsync_ValidRequest_ReturnsPerson()
    {
        // Arrange
        var accessToken = fixture.Create<string>();
        var request = new PipedriveCreatePersonRequest
        {
            Name = "New Person",
            Phone = new List<PipedrivePhoneInput>
            {
                new PipedrivePhoneInput { Value = "+48123456789", Label = "WhatsApp", Primary = true }
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
                    new PipedrivePhone { Value = "+48123456789", Label = "WhatsApp", Primary = true }
                }
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(personResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act
        var result = await client.CreatePersonAsync(accessToken, request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(456, result.Data.Id);
        Assert.Equal("New Person", result.Data.Name);
    }

    [Fact]
    public async Task CreatePersonAsync_Unauthorized_ThrowsException()
    {
        // Arrange
        var accessToken = "invalid-token";
        var request = new PipedriveCreatePersonRequest
        {
            Name = "Test Person"
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Unauthorized,
            "{\"error\":\"Unauthorized\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveUnauthorizedException>(
            () => client.CreatePersonAsync(accessToken, request)
        );
    }

    #endregion

    #region GetPersonAsync Tests

    [Fact]
    public async Task GetPersonAsync_ExistingPerson_ReturnsPerson()
    {
        // Arrange
        var accessToken = fixture.Create<string>();
        var personId = 123;

        var personResponse = new PipedrivePersonResponse
        {
            Success = true,
            Data = new PipedrivePerson
            {
                Id = personId,
                Name = "Existing Person",
                Phone = new List<PipedrivePhone>
                {
                    new PipedrivePhone { Value = "+48123456789", Label = "mobile", Primary = true }
                }
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(personResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act
        var result = await client.GetPersonAsync(accessToken, personId);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(personId, result.Data.Id);
        Assert.Equal("Existing Person", result.Data.Name);
    }

    [Fact]
    public async Task GetPersonAsync_PersonNotFound_ThrowsException()
    {
        // Arrange
        var accessToken = fixture.Create<string>();
        var personId = 99999;

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.NotFound,
            "{\"error\":\"Person not found\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveNotFoundException>(
            () => client.GetPersonAsync(accessToken, personId)
        );
    }

    [Fact]
    public async Task GetPersonAsync_Unauthorized_ThrowsException()
    {
        // Arrange
        var accessToken = "invalid-token";
        var personId = 123;

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Unauthorized,
            "{\"error\":\"Unauthorized\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveUnauthorizedException>(
            () => client.GetPersonAsync(accessToken, personId)
        );
    }

    #endregion

    #region UpdatePersonAsync Tests

    [Fact]
    public async Task UpdatePersonAsync_ValidRequest_ReturnsUpdatedPerson()
    {
        // Arrange
        var accessToken = fixture.Create<string>();
        var personId = 123;
        var request = new PipedriveUpdatePersonRequest
        {
            Phone = new List<PipedrivePhoneInput>
            {
                new PipedrivePhoneInput { Value = "+48123456789", Label = "mobile", Primary = true },
                new PipedrivePhoneInput { Value = "+48987654321", Label = "WhatsApp", Primary = false }
            }
        };

        var personResponse = new PipedrivePersonResponse
        {
            Success = true,
            Data = new PipedrivePerson
            {
                Id = personId,
                Name = "Updated Person",
                Phone = new List<PipedrivePhone>
                {
                    new PipedrivePhone { Value = "+48123456789", Label = "mobile", Primary = true },
                    new PipedrivePhone { Value = "+48987654321", Label = "WhatsApp", Primary = false }
                }
            }
        };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(personResponse)
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act
        var result = await client.UpdatePersonAsync(accessToken, personId, request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(personId, result.Data.Id);
        Assert.Equal(2, result.Data.Phone?.Count);
    }

    [Fact]
    public async Task UpdatePersonAsync_Unauthorized_ThrowsException()
    {
        // Arrange
        var accessToken = "invalid-token";
        var personId = 123;
        var request = new PipedriveUpdatePersonRequest();

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.Unauthorized,
            "{\"error\":\"Unauthorized\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveUnauthorizedException>(
            () => client.UpdatePersonAsync(accessToken, personId, request)
        );
    }

    #endregion

    #region Error Handling Tests

    [Fact]
    public async Task SearchPersonsAsync_RateLimited_ThrowsException()
    {
        // Arrange
        var accessToken = fixture.Create<string>();
        var term = "+48123456789";
        var fields = "phone";

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            (HttpStatusCode)429,
            "{\"error\":\"Rate limit exceeded\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveRateLimitException>(
            () => client.SearchPersonsAsync(accessToken, term, fields)
        );
    }

    [Fact]
    public async Task CreatePersonAsync_ServerError_ThrowsException()
    {
        // Arrange
        var accessToken = fixture.Create<string>();
        var request = new PipedriveCreatePersonRequest { Name = "Test" };

        var mockHttpMessageHandler = CreateMockHttpMessageHandler(
            HttpStatusCode.InternalServerError,
            "{\"error\":\"Internal server error\"}"
        );

        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        var client = new PipedriveApiClient(httpClient, config, mockLogger.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PipedriveApiException>(
            () => client.CreatePersonAsync(accessToken, request)
        );
    }

    #endregion

    #region Helper Methods

    private Mock<HttpMessageHandler> CreateMockHttpMessageHandler(HttpStatusCode statusCode, string responseContent)
    {
        var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        mockHttpMessageHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(responseContent, Encoding.UTF8, "application/json")
            });

        return mockHttpMessageHandler;
    }

    #endregion
}
