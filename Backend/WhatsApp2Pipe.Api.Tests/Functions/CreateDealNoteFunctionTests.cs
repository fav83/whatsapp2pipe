using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Moq;
using WhatsApp2Pipe.Api.Functions;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Tests.Functions;

public class CreateDealNoteFunctionTests
{
    private readonly Mock<ILogger<PipedriveDealNotesCreateFunction>> mockLogger;
    private readonly Mock<ISessionService> mockSessionService;
    private readonly Mock<IPipedriveApiClient> mockPipedriveApiClient;
    private readonly HttpRequestLogger httpRequestLogger;
    private readonly PipedriveDealNotesCreateFunction function;

    public CreateDealNoteFunctionTests()
    {
        mockLogger = new Mock<ILogger<PipedriveDealNotesCreateFunction>>();
        mockSessionService = new Mock<ISessionService>();
        mockPipedriveApiClient = new Mock<IPipedriveApiClient>();

        // Create real instances with mocked dependencies
        var mockHttpRequestLoggerLogger = new Mock<ILogger<HttpRequestLogger>>();
        var telemetryConfig = new TelemetryConfiguration();
        var telemetryClient = new TelemetryClient(telemetryConfig);
        httpRequestLogger = new HttpRequestLogger(telemetryClient, mockHttpRequestLoggerLogger.Object);

        function = new PipedriveDealNotesCreateFunction(
            mockLogger.Object,
            mockSessionService.Object,
            mockPipedriveApiClient.Object,
            httpRequestLogger
        );
    }

    [Fact]
    public async Task Run_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = "Important deal note" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveNoteResponse = new PipedriveNoteResponse
        {
            Success = true,
            Data = new PipedriveNote { Id = 456, Content = "Important deal note", DealId = 789 }
        };

        mockPipedriveApiClient.Setup(c => c.CreateNoteAsync(session, "Important deal note", null, 789))
            .ReturnsAsync(pipedriveNoteResponse);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Run_MissingAuthorizationHeader_ReturnsUnauthorized()
    {
        // Arrange
        var request = CreateMockHttpRequest(null, new { dealId = 789, content = "Test content" });

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Run_InvalidAuthorizationHeaderFormat_ReturnsUnauthorized()
    {
        // Arrange
        var request = CreateMockHttpRequest("InvalidFormat", new { dealId = 789, content = "Test content" });

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Run_ExpiredSession_ReturnsUnauthorized()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = "Test content" });

        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync((Session?)null);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Run_EmptyRequestBody_ReturnsBadRequest()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", string.Empty);

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        Assert.Contains("Request body is required", body);
    }

    [Fact]
    public async Task Run_InvalidRequestBody_ReturnsBadRequest()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", "invalid json");

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        Assert.Contains("Invalid request body", body);
    }

    [Fact]
    public async Task Run_MissingDealId_ReturnsBadRequest()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { content = "Test content" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        Assert.Contains("DealId must be greater than 0", body);
    }

    [Fact]
    public async Task Run_InvalidDealId_ReturnsBadRequest()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 0, content = "Test content" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        Assert.Contains("DealId must be greater than 0", body);
    }

    [Fact]
    public async Task Run_MissingContent_ReturnsBadRequest()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789 });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        Assert.Contains("Content is required", body);
    }

    [Fact]
    public async Task Run_EmptyContent_ReturnsBadRequest()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = "" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        Assert.Contains("Content is required", body);
    }

    [Fact]
    public async Task Run_WhitespaceContent_ReturnsBadRequest()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = "   " });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        Assert.Contains("Content is required", body);
    }

    [Fact]
    public async Task Run_PipedriveReturnsNullData_ReturnsInternalServerError()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = "Test content" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveNoteResponse = new PipedriveNoteResponse
        {
            Success = false,
            Data = null
        };

        mockPipedriveApiClient.Setup(c => c.CreateNoteAsync(session, "Test content", null, 789))
            .ReturnsAsync(pipedriveNoteResponse);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task Run_PipedriveUnauthorized_ReturnsUnauthorizedWithSessionExpired()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = "Test content" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        mockPipedriveApiClient.Setup(c => c.CreateNoteAsync(session, "Test content", null, 789))
            .ThrowsAsync(new PipedriveUnauthorizedException("Token refresh failed"));

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        var responseData = JsonSerializer.Deserialize<JsonElement>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.Equal("session_expired", responseData.GetProperty("error").GetString());
        Assert.Contains("please sign in again", responseData.GetProperty("message").GetString());
    }

    [Fact]
    public async Task Run_RateLimitExceeded_ReturnsTooManyRequests()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = "Test content" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        mockPipedriveApiClient.Setup(c => c.CreateNoteAsync(session, "Test content", null, 789))
            .ThrowsAsync(new PipedriveRateLimitException("Rate limit exceeded"));

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Fact]
    public async Task Run_GenericException_ReturnsInternalServerError()
    {
        // Arrange
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = "Test content" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        mockPipedriveApiClient.Setup(c => c.CreateNoteAsync(session, "Test content", null, 789))
            .ThrowsAsync(new Exception("Unexpected error"));

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task Run_LongContent_ReturnsCreated()
    {
        // Arrange
        var longContent = new string('A', 10000);
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = longContent });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveNoteResponse = new PipedriveNoteResponse
        {
            Success = true,
            Data = new PipedriveNote { Id = 456, Content = longContent, DealId = 789 }
        };

        mockPipedriveApiClient.Setup(c => c.CreateNoteAsync(session, longContent, null, 789))
            .ReturnsAsync(pipedriveNoteResponse);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        mockPipedriveApiClient.Verify(c => c.CreateNoteAsync(session, longContent, null, 789), Times.Once);
    }

    [Fact]
    public async Task Run_ContentWithSpecialCharacters_ReturnsCreated()
    {
        // Arrange
        var specialContent = "Test & <script>alert('XSS')</script> \"quotes\" and 'apostrophes' with newlines\nand tabs\t";
        var request = CreateMockHttpRequest("Bearer test-code", new { dealId = 789, content = specialContent });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveNoteResponse = new PipedriveNoteResponse
        {
            Success = true,
            Data = new PipedriveNote { Id = 456, Content = specialContent, DealId = 789 }
        };

        mockPipedriveApiClient.Setup(c => c.CreateNoteAsync(session, specialContent, null, 789))
            .ReturnsAsync(pipedriveNoteResponse);

        // Act
        var response = await function.Run(request.Object);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        mockPipedriveApiClient.Verify(c => c.CreateNoteAsync(session, specialContent, null, 789), Times.Once);
    }

    #region Helper Methods

    private Session CreateTestSession()
    {
        return new Session
        {
            SessionId = Guid.NewGuid(),
            VerificationCode = "test-code",
            UserId = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            AccessToken = "test-access-token",
            RefreshToken = "test-refresh-token",
            ApiDomain = "test.pipedrive.com",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            SessionExpiresAt = DateTime.UtcNow.AddDays(60),
            ExtensionId = "test-extension-id",
            CreatedAt = DateTime.UtcNow
        };
    }

    private Mock<HttpRequestData> CreateMockHttpRequest(string? authHeader, object body)
    {
        var json = JsonSerializer.Serialize(body);
        return CreateMockHttpRequest(authHeader, json);
    }

    private Mock<HttpRequestData> CreateMockHttpRequest(string? authHeader, string body)
    {
        // Create mock FunctionContext
        var mockContext = new Mock<FunctionContext>();

        // Create mock HttpRequestData
        var mockRequest = new Mock<HttpRequestData>(mockContext.Object);

        // Setup Method
        mockRequest.Setup(r => r.Method).Returns("POST");

        // Setup Headers
        var headers = new HttpHeadersCollection();
        if (!string.IsNullOrEmpty(authHeader))
        {
            headers.Add("Authorization", authHeader);
        }
        mockRequest.Setup(r => r.Headers).Returns(headers);

        // Setup Body (ReadAsStringAsync is an extension method that reads from Body)
        var bodyStream = new MemoryStream(Encoding.UTF8.GetBytes(body));
        bodyStream.Position = 0; // Ensure stream is at the beginning
        mockRequest.Setup(r => r.Body).Returns(bodyStream);

        // Setup FunctionContext for CreateResponse extension method
        mockRequest.Setup(r => r.FunctionContext).Returns(mockContext.Object);

        // Setup CreateResponse - must return a callable that creates responses
        mockRequest.Setup(r => r.CreateResponse())
            .Returns(() =>
            {
                var mockResponse = new Mock<HttpResponseData>(mockContext.Object);
                mockResponse.SetupProperty(r => r.StatusCode);
                mockResponse.SetupProperty(r => r.Body, new MemoryStream());
                mockResponse.Setup(r => r.Headers).Returns(new HttpHeadersCollection());
                return mockResponse.Object;
            });

        return mockRequest;
    }

    #endregion
}
