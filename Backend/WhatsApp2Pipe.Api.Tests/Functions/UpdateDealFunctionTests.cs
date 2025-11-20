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

public class UpdateDealFunctionTests
{
    private readonly Mock<ILogger<UpdateDealFunction>> mockLogger;
    private readonly Mock<ISessionService> mockSessionService;
    private readonly Mock<IPipedriveApiClient> mockPipedriveApiClient;
    private readonly DealTransformService dealTransformService;
    private readonly HttpRequestLogger httpRequestLogger;
    private readonly UpdateDealFunction function;

    public UpdateDealFunctionTests()
    {
        mockLogger = new Mock<ILogger<UpdateDealFunction>>();
        mockSessionService = new Mock<ISessionService>();
        mockPipedriveApiClient = new Mock<IPipedriveApiClient>();

        // Create real instances with mocked dependencies
        dealTransformService = new DealTransformService();

        var mockHttpRequestLoggerLogger = new Mock<ILogger<HttpRequestLogger>>();
        var telemetryConfig = new TelemetryConfiguration();
        var telemetryClient = new TelemetryClient(telemetryConfig);
        httpRequestLogger = new HttpRequestLogger(telemetryClient, mockHttpRequestLoggerLogger.Object);

        function = new UpdateDealFunction(
            mockLogger.Object,
            mockSessionService.Object,
            mockPipedriveApiClient.Object,
            dealTransformService,
            httpRequestLogger
        );
    }

    [Fact]
    public async Task Run_ValidRequest_ReturnsOkWithTransformedDeal()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest(
            "Bearer test-code",
            new { pipelineId = 1, stageId = 5 }
        );

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        var pipedriveDeal = new PipedriveDeal
        {
            Id = dealId,
            Title = "Test Deal",
            StageId = 5,
            Status = "open"
        };

        mockPipedriveApiClient.Setup(c => c.UpdateDealAsync(session, dealId, 5))
            .ReturnsAsync(pipedriveDeal);

        var stages = new[] { new PipedriveStage { Id = 5, Name = "Negotiation", OrderNr = 2, PipelineId = 1 } };
        var pipelines = new[] { new PipedrivePipeline { Id = 1, Name = "Sales", OrderNr = 1, Active = true } };

        mockPipedriveApiClient.Setup(c => c.GetStagesAsync(session))
            .ReturnsAsync(new PipedriveStagesResponse { Success = true, Data = stages });

        mockPipedriveApiClient.Setup(c => c.GetPipelinesAsync(session))
            .ReturnsAsync(new PipedrivePipelinesResponse { Success = true, Data = pipelines });

        // The real DealTransformService will transform the deal

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var bodyStream = response.Body;
        bodyStream.Position = 0;
        using var reader = new StreamReader(bodyStream);
        var body = await reader.ReadToEndAsync();
        var deal = JsonSerializer.Deserialize<Deal>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(deal);
        Assert.Equal(dealId, deal.Id);
        Assert.Equal("Test Deal", deal.Title);
    }

    [Fact]
    public async Task Run_MissingAuthorizationHeader_ReturnsUnauthorized()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest(null, new { pipelineId = 1, stageId = 5 });

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
        var request = CreateMockHttpRequest("InvalidFormat", new { pipelineId = 1, stageId = 5 });

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
        var request = CreateMockHttpRequest("Bearer test-code", new { pipelineId = 1, stageId = 5 });

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
    public async Task Run_MissingRequiredFields_ReturnsBadRequest()
    {
        // Arrange
        var dealId = 123;
        var request = CreateMockHttpRequest("Bearer test-code", new { pipelineId = 0, stageId = 0 });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Run_DealNotFound_ReturnsNotFound()
    {
        // Arrange
        var dealId = 999;
        var request = CreateMockHttpRequest("Bearer test-code", new { pipelineId = 1, stageId = 5 });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        mockPipedriveApiClient.Setup(c => c.UpdateDealAsync(session, dealId, 5))
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
        var request = CreateMockHttpRequest("Bearer test-code", new { pipelineId = 1, stageId = 5 });

        var session = CreateTestSession();
        mockSessionService.Setup(s => s.GetSessionAsync("test-code"))
            .ReturnsAsync(session);

        mockPipedriveApiClient.Setup(c => c.UpdateDealAsync(session, dealId, 5))
            .ThrowsAsync(new PipedriveUnauthorizedException("Unauthorized"));

        // Act
        var response = await function.Run(request.Object, dealId);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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
