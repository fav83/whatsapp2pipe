using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Tests.Services;

public class DealTransformServiceTests
{
    private readonly DealTransformService service;

    public DealTransformServiceTests()
    {
        service = new DealTransformService();
    }

    #region TransformDeals Tests

    [Fact]
    public void TransformDeals_ValidData_TransformsAndEnrichesCorrectly()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Website Redesign",
                Value = 50000m,
                Currency = "USD",
                StageId = 2,
                Status = "open",
                UpdateTime = "2024-01-20 10:00:00"
            },
            new PipedriveDeal
            {
                Id = 2,
                Title = "Mobile App",
                Value = 30000m,
                Currency = "EUR",
                StageId = 8,
                Status = "won",
                UpdateTime = "2024-01-15 09:00:00"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 2, Name = "Proposal", OrderNr = 2, PipelineId = 1 },
            new PipedriveStage { Id = 8, Name = "Won", OrderNr = 99, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Sales Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Equal(2, deals.Count);

        // Check first deal
        Assert.Equal(1, deals[0].Id);
        Assert.Equal("Website Redesign", deals[0].Title);
        Assert.StartsWith("$50,000", deals[0].Value); // Format may vary by culture
        Assert.Equal(2, deals[0].Stage.Id);
        Assert.Equal("Proposal", deals[0].Stage.Name);
        Assert.Equal(2, deals[0].Stage.Order);
        Assert.Equal(1, deals[0].Pipeline.Id);
        Assert.Equal("Sales Pipeline", deals[0].Pipeline.Name);
        Assert.Equal("open", deals[0].Status);

        // Check second deal
        Assert.Equal(2, deals[1].Id);
        Assert.Equal("Mobile App", deals[1].Title);
        Assert.Contains("30", deals[1].Value); // EUR format may vary
        Assert.Equal(8, deals[1].Stage.Id);
        Assert.Equal("Won", deals[1].Stage.Name);
        Assert.Equal(99, deals[1].Stage.Order);
        Assert.Equal(1, deals[1].Pipeline.Id);
        Assert.Equal("Sales Pipeline", deals[1].Pipeline.Name);
        Assert.Equal("won", deals[1].Status);
    }

    [Fact]
    public void TransformDeals_EmptyArrays_ReturnsEmptyList()
    {
        // Arrange
        var pipedriveDeals = Array.Empty<PipedriveDeal>();
        var stages = Array.Empty<PipedriveStage>();
        var pipelines = Array.Empty<PipedrivePipeline>();

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.NotNull(deals);
        Assert.Empty(deals);
    }

    [Fact]
    public void TransformDeals_InvalidStageId_SkipsDeal()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Deal with invalid stage",
                Value = 1000m,
                Currency = "USD",
                StageId = 999, // Non-existent stage
                Status = "open"
            },
            new PipedriveDeal
            {
                Id = 2,
                Title = "Valid deal",
                Value = 2000m,
                Currency = "USD",
                StageId = 1,
                Status = "open"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Qualified", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Sales Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Equal(2, deals[0].Id);
        Assert.Equal("Valid deal", deals[0].Title);
    }

    [Fact]
    public void TransformDeals_InvalidPipelineId_SkipsDeal()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Deal with invalid pipeline",
                Value = 1000m,
                Currency = "USD",
                StageId = 1,
                Status = "open"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Qualified", OrderNr = 1, PipelineId = 999 } // Non-existent pipeline
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Sales Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Empty(deals);
    }

    [Fact]
    public void TransformDeals_SortsCorrectly_OpenWonLost()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal { Id = 1, Title = "Lost Deal", Value = 1000m, Currency = "USD", StageId = 1, Status = "lost" },
            new PipedriveDeal { Id = 2, Title = "Won Deal", Value = 2000m, Currency = "USD", StageId = 1, Status = "won" },
            new PipedriveDeal { Id = 3, Title = "Open Deal", Value = 3000m, Currency = "USD", StageId = 1, Status = "open" }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Equal(3, deals.Count);
        Assert.Equal("open", deals[0].Status); // Open first
        Assert.Equal("won", deals[1].Status);  // Won second
        Assert.Equal("lost", deals[2].Status); // Lost last
    }

    #endregion

    #region Currency Formatting Tests

    [Fact]
    public void TransformDeals_USD_FormatsCorrectly()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "USD Deal",
                Value = 50000m,
                Currency = "USD",
                StageId = 1,
                Status = "open"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Contains("$", deals[0].Value);
        Assert.Contains("50", deals[0].Value);
    }

    [Fact]
    public void TransformDeals_EUR_FormatsCorrectly()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "EUR Deal",
                Value = 30000m,
                Currency = "EUR",
                StageId = 1,
                Status = "open"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Contains("30", deals[0].Value);
        // EUR format varies by culture, so just check the value is present
    }

    [Fact]
    public void TransformDeals_GBP_FormatsCorrectly()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "GBP Deal",
                Value = 20000m,
                Currency = "GBP",
                StageId = 1,
                Status = "open"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Contains("£", deals[0].Value);
        Assert.Contains("20", deals[0].Value);
    }

    [Fact]
    public void TransformDeals_UnknownCurrency_FormatsWithInvariantCulture()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Unknown Currency Deal",
                Value = 10000m,
                Currency = "XYZ",
                StageId = 1,
                Status = "open"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        // Unknown currency uses InvariantCulture which formats as "¤10,000.00"
        Assert.Contains("10", deals[0].Value);
        Assert.Contains(",", deals[0].Value);
    }

    [Fact]
    public void TransformDeals_ZeroValue_FormatsCorrectly()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Zero Value Deal",
                Value = 0m,
                Currency = "USD",
                StageId = 1,
                Status = "open"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Contains("$", deals[0].Value);
        Assert.Contains("0", deals[0].Value);
    }

    #endregion

    #region Multiple Pipelines Tests

    [Fact]
    public void TransformDeals_MultiplePipelines_AssignsCorrectPipeline()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal { Id = 1, Title = "Sales Deal", Value = 1000m, Currency = "USD", StageId = 1, Status = "open" },
            new PipedriveDeal { Id = 2, Title = "Marketing Deal", Value = 2000m, Currency = "USD", StageId = 2, Status = "open" }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Qualified", OrderNr = 1, PipelineId = 1 },
            new PipedriveStage { Id = 2, Name = "Planning", OrderNr = 1, PipelineId = 2 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Sales Pipeline" },
            new PipedrivePipeline { Id = 2, Name = "Marketing Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Equal(2, deals.Count);
        Assert.Equal("Sales Pipeline", deals[0].Pipeline.Name);
        Assert.Equal("Marketing Pipeline", deals[1].Pipeline.Name);
    }

    #endregion

    #region Won/Lost Fields Tests

    [Fact]
    public void TransformDeals_LostDealWithReason_IncludesLostReason()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Lost Deal",
                Value = 50000m,
                Currency = "USD",
                StageId = 1,
                Status = "lost",
                LostReason = "Customer chose competitor",
                UpdateTime = "2025-01-20 15:30:00"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Equal("lost", deals[0].Status);
        Assert.Equal("Customer chose competitor", deals[0].LostReason);
        Assert.Equal("2025-01-20 15:30:00", deals[0].UpdateTime);
    }

    [Fact]
    public void TransformDeals_WonDeal_NullLostReason()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Won Deal",
                Value = 75000m,
                Currency = "USD",
                StageId = 1,
                Status = "won",
                LostReason = null,
                UpdateTime = "2025-01-21 10:00:00"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Equal("won", deals[0].Status);
        Assert.Null(deals[0].LostReason);
        Assert.Equal("2025-01-21 10:00:00", deals[0].UpdateTime);
    }

    [Fact]
    public void TransformDeals_OpenDeal_NullLostReason()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Open Deal",
                Value = 25000m,
                Currency = "USD",
                StageId = 1,
                Status = "open",
                LostReason = null,
                UpdateTime = "2025-01-22 14:30:00"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Equal("open", deals[0].Status);
        Assert.Null(deals[0].LostReason);
        Assert.Equal("2025-01-22 14:30:00", deals[0].UpdateTime);
    }

    [Fact]
    public void TransformDeals_MixedStatusesWithLostReason_OnlyLostHasReason()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Open Deal",
                Value = 1000m,
                Currency = "USD",
                StageId = 1,
                Status = "open",
                LostReason = null,
                UpdateTime = "2025-01-20 10:00:00"
            },
            new PipedriveDeal
            {
                Id = 2,
                Title = "Won Deal",
                Value = 2000m,
                Currency = "USD",
                StageId = 1,
                Status = "won",
                LostReason = null,
                UpdateTime = "2025-01-21 11:00:00"
            },
            new PipedriveDeal
            {
                Id = 3,
                Title = "Lost Deal",
                Value = 3000m,
                Currency = "USD",
                StageId = 1,
                Status = "lost",
                LostReason = "Budget constraints",
                UpdateTime = "2025-01-22 12:00:00"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Equal(3, deals.Count);

        // Open deal (first in sort order)
        Assert.Equal("open", deals[0].Status);
        Assert.Null(deals[0].LostReason);
        Assert.Equal("2025-01-20 10:00:00", deals[0].UpdateTime);

        // Won deal (second in sort order)
        Assert.Equal("won", deals[1].Status);
        Assert.Null(deals[1].LostReason);
        Assert.Equal("2025-01-21 11:00:00", deals[1].UpdateTime);

        // Lost deal (third in sort order)
        Assert.Equal("lost", deals[2].Status);
        Assert.Equal("Budget constraints", deals[2].LostReason);
        Assert.Equal("2025-01-22 12:00:00", deals[2].UpdateTime);
    }

    [Fact]
    public void TransformDeals_NullUpdateTime_HandlesCorrectly()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Deal Without UpdateTime",
                Value = 10000m,
                Currency = "USD",
                StageId = 1,
                Status = "open",
                LostReason = null,
                UpdateTime = null
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Equal("open", deals[0].Status);
        Assert.Null(deals[0].LostReason);
        Assert.Null(deals[0].UpdateTime);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void TransformDeals_NullStageArrays_ReturnsEmptyList()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal { Id = 1, Title = "Deal", Value = 1000m, Currency = "USD", StageId = 1, Status = "open" }
        };

        var stages = Array.Empty<PipedriveStage>();
        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Empty(deals);
    }

    [Fact]
    public void TransformDeals_UnknownStatus_StillIncludesDeal()
    {
        // Arrange
        var pipedriveDeals = new[]
        {
            new PipedriveDeal
            {
                Id = 1,
                Title = "Unknown Status Deal",
                Value = 1000m,
                Currency = "USD",
                StageId = 1,
                Status = "unknown_status"
            }
        };

        var stages = new[]
        {
            new PipedriveStage { Id = 1, Name = "Stage", OrderNr = 1, PipelineId = 1 }
        };

        var pipelines = new[]
        {
            new PipedrivePipeline { Id = 1, Name = "Pipeline" }
        };

        // Act
        var deals = service.TransformDeals(pipedriveDeals, stages, pipelines);

        // Assert
        Assert.Single(deals);
        Assert.Equal("unknown_status", deals[0].Status);
    }

    #endregion
}
