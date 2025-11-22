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

public class MarkDealWonLostFunctionTests
{
    private readonly Mock<ILogger<MarkDealWonLostFunction>> mockLogger;
    private readonly Mock<ISessionService> mockSessionService;
    private readonly Mock<IPipedriveApiClient> mockPipedriveApiClient;
    private readonly DealTransformService dealTransformService;
    private readonly HttpRequestLogger httpRequestLogger;
    private readonly MarkDealWonLostFunction function;

    public MarkDealWonLostFunctionTests()
    {
        mockLogger = new Mock<ILogger<MarkDealWonLostFunction>>();
        mockSessionService = new Mock<ISessionService>();
        mockPipedriveApiClient = new Mock<IPipedriveApiClient>();

        // Create real instances with mocked dependencies
        dealTransformService = new DealTransformService();

        var mockHttpRequestLoggerLogger = new Mock<ILogger<HttpRequestLogger>>();
        var telemetryConfig = new TelemetryConfiguration();
        var telemetryClient = new TelemetryClient(telemetryConfig);
        httpRequestLogger = new HttpRequestLogger(telemetryClient, mockHttpRequestLoggerLogger.Object);

        function = new MarkDealWonLostFunction(
            mockLogger.Object,
            mockSessionService.Object,
            mockPipedriveApiClient.Object,
            dealTransformService,
            httpRequestLogger
        );
    }

    [Fact]
    public async Task Run_ValidWonRequest_ReturnsOkWithTransformedDeal()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "won" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveDeal = new PipedriveDeal
        {
            Id = dealId,
            Title = "Test Deal",
            Value = 50000,
            Currency = "USD",
            StageId = 5,
            Status = "won"
        };

        mockPipedriveApiClient.Setup(c => c.MarkDealWonLostAsync(session, dealId, "won", null))
            .ReturnsAsync(pipedriveDeal);

        var stages = new[] { new PipedriveStage { Id = 5, Name = "Negotiation", OrderNr = 2, PipelineId = 1 } };
        var pipelines = new[] { new PipedrivePipeline { Id = 1, Name = "Sales", OrderNr = 1, Active = true } };

        mockPipedriveApiClient.Setup(c => c.GetStagesAsync(session))
            .ReturnsAsync(new PipedriveStagesResponse { Success = true, Data = stages });

        mockPipedriveApiClient.Setup(c => c.GetPipelinesAsync(session))
            .ReturnsAsync(new PipedrivePipelinesResponse { Success = true, Data = pipelines });

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        var responseData = JsonSerializer.Deserialize<JsonElement>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.True(responseData.GetProperty("success").GetBoolean());
        var deal = responseData.GetProperty("data");
        Assert.Equal(dealId, deal.GetProperty("id").GetInt32());
        Assert.Equal("Test Deal", deal.GetProperty("title").GetString());
        Assert.Equal("won", deal.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Run_ValidLostRequestWithReason_ReturnsOkWithTransformedDeal()
    {
        // Arrange
        var dealId = 123;
        var lostReason = "Customer chose competitor";
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "lost", lostReason });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveDeal = new PipedriveDeal
        {
            Id = dealId,
            Title = "Test Deal",
            Value = 50000,
            Currency = "USD",
            StageId = 5,
            Status = "lost",
            LostReason = lostReason
        };

        mockPipedriveApiClient.Setup(c => c.MarkDealWonLostAsync(session, dealId, "lost", lostReason))
            .ReturnsAsync(pipedriveDeal);

        var stages = new[] { new PipedriveStage { Id = 5, Name = "Negotiation", OrderNr = 2, PipelineId = 1 } };
        var pipelines = new[] { new PipedrivePipeline { Id = 1, Name = "Sales", OrderNr = 1, Active = true } };

        mockPipedriveApiClient.Setup(c => c.GetStagesAsync(session))
            .ReturnsAsync(new PipedriveStagesResponse { Success = true, Data = stages });

        mockPipedriveApiClient.Setup(c => c.GetPipelinesAsync(session))
            .ReturnsAsync(new PipedrivePipelinesResponse { Success = true, Data = pipelines });

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        var responseData = JsonSerializer.Deserialize<JsonElement>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.True(responseData.GetProperty("success").GetBoolean());
        var deal = responseData.GetProperty("data");
        Assert.Equal(dealId, deal.GetProperty("id").GetInt32());
        Assert.Equal("lost", deal.GetProperty("status").GetString());
        Assert.Equal(lostReason, deal.GetProperty("lostReason").GetString());
    }

    [Fact]
    public async Task Run_MissingAuthorizationHeader_ReturnsUnauthorized()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest(null, new { status = "won" });

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Run_InvalidAuthorizationHeaderFormat_ReturnsUnauthorized()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("InvalidFormat", new { status = "won" });

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Run_ExpiredSession_ReturnsUnauthorized()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "won" });

        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync((Session?)null);

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Run_EmptyRequestBody_ReturnsBadRequest()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", string.Empty);

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Run_InvalidRequestBody_ReturnsBadRequest()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", "invalid json");

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Run_MissingStatus_ReturnsBadRequest()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Run_InvalidStatusValue_ReturnsBadRequest()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "invalid" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        Assert.Contains("won", body);
        Assert.Contains("lost", body);
    }

    [Fact]
    public async Task Run_LostStatusWithoutReason_ReturnsOk()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "lost" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveDeal = new PipedriveDeal
        {
            Id = dealId,
            Title = "Test Deal",
            Value = 50000,
            Currency = "USD",
            StageId = 5,
            Status = "lost",
            LostReason = null
        };

        mockPipedriveApiClient.Setup(c => c.MarkDealWonLostAsync(session, dealId, "lost", null))
            .ReturnsAsync(pipedriveDeal);

        var stages = new[] { new PipedriveStage { Id = 5, Name = "Negotiation", OrderNr = 2, PipelineId = 1 } };
        var pipelines = new[] { new PipedrivePipeline { Id = 1, Name = "Sales", OrderNr = 1, Active = true } };

        mockPipedriveApiClient.Setup(c => c.GetStagesAsync(session))
            .ReturnsAsync(new PipedriveStagesResponse { Success = true, Data = stages });

        mockPipedriveApiClient.Setup(c => c.GetPipelinesAsync(session))
            .ReturnsAsync(new PipedrivePipelinesResponse { Success = true, Data = pipelines });

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        var responseData = JsonSerializer.Deserialize<JsonElement>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.True(responseData.GetProperty("success").GetBoolean());
        var deal = responseData.GetProperty("data");
        Assert.Equal(dealId, deal.GetProperty("id").GetInt32());
        Assert.Equal("lost", deal.GetProperty("status").GetString());
        // Lost reason should be null when not provided
        Assert.Equal(JsonValueKind.Null, deal.GetProperty("lostReason").ValueKind);
    }

    [Fact]
    public async Task Run_LostReasonTooLong_ReturnsBadRequest()
    {
        // Arrange
        var dealId = 123;
        var longReason = new string('a', 151); // 151 characters
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "lost", lostReason = longReason });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        Assert.Contains("150 characters", body);
    }

    [Fact]
    public async Task Run_DealNotFound_ReturnsNotFound()
    {
        // Arrange
        var dealId = 999;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "won" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        mockPipedriveApiClient.Setup(c => c.MarkDealWonLostAsync(session, dealId, "won", null))
            .ThrowsAsync(new PipedriveNotFoundException("Deal not found"));

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Run_PipedriveUnauthorized_ReturnsUnauthorized()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "won" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        mockPipedriveApiClient.Setup(c => c.MarkDealWonLostAsync(session, dealId, "won", null))
            .ThrowsAsync(new PipedriveUnauthorizedException("Unauthorized"));

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Run_RateLimitExceeded_ReturnsTooManyRequests()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "won" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        mockPipedriveApiClient.Setup(c => c.MarkDealWonLostAsync(session, dealId, "won", null))
            .ThrowsAsync(new PipedriveRateLimitException("Rate limit exceeded"));

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Fact]
    public async Task Run_ValidReopenRequest_ReturnsOkWithTransformedDeal()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "open" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveDeal = new PipedriveDeal
        {
            Id = dealId,
            Title = "Test Deal",
            Value = 50000,
            Currency = "USD",
            StageId = 5,
            Status = "open"
        };

        mockPipedriveApiClient.Setup(c => c.MarkDealWonLostAsync(session, dealId, "open", null))
            .ReturnsAsync(pipedriveDeal);

        var stages = new[] { new PipedriveStage { Id = 5, Name = "Negotiation", OrderNr = 2, PipelineId = 1 } };
        var pipelines = new[] { new PipedrivePipeline { Id = 1, Name = "Sales", OrderNr = 1, Active = true } };

        mockPipedriveApiClient.Setup(c => c.GetStagesAsync(session))
            .ReturnsAsync(new PipedriveStagesResponse { Success = true, Data = stages });

        mockPipedriveApiClient.Setup(c => c.GetPipelinesAsync(session))
            .ReturnsAsync(new PipedrivePipelinesResponse { Success = true, Data = pipelines });

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        var responseData = JsonSerializer.Deserialize<JsonElement>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.True(responseData.GetProperty("success").GetBoolean());
        var deal = responseData.GetProperty("data");
        Assert.Equal(dealId, deal.GetProperty("id").GetInt32());
        Assert.Equal("Test Deal", deal.GetProperty("title").GetString());
        Assert.Equal("open", deal.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Run_ReopenStatusAcceptedInValidation_ReturnsOk()
    {
        // Arrange
        var dealId = 456;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "open" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveDeal = new PipedriveDeal
        {
            Id = dealId,
            Title = "Reopened Deal",
            Value = 25000,
            Currency = "USD",
            StageId = 3,
            Status = "open"
        };

        mockPipedriveApiClient.Setup(c => c.MarkDealWonLostAsync(session, dealId, "open", null))
            .ReturnsAsync(pipedriveDeal);

        var stages = new[] { new PipedriveStage { Id = 3, Name = "Proposal", OrderNr = 3, PipelineId = 1 } };
        var pipelines = new[] { new PipedrivePipeline { Id = 1, Name = "Sales", OrderNr = 1, Active = true } };

        mockPipedriveApiClient.Setup(c => c.GetStagesAsync(session))
            .ReturnsAsync(new PipedriveStagesResponse { Success = true, Data = stages });

        mockPipedriveApiClient.Setup(c => c.GetPipelinesAsync(session))
            .ReturnsAsync(new PipedrivePipelinesResponse { Success = true, Data = pipelines });

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert - Should pass validation and return OK (not BadRequest)
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        var responseData = JsonSerializer.Deserialize<JsonElement>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.True(responseData.GetProperty("success").GetBoolean());
    }

    [Fact]
    public async Task Run_InvalidStatusValueWithOpenSupport_ReturnsBadRequest()
    {
        // Arrange - Test that "open" is now valid but other values are still rejected
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { status = "pending" });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        // Error message should mention won, lost, and open as valid statuses
        Assert.Contains("won", body);
        Assert.Contains("lost", body);
        Assert.Contains("open", body);
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
