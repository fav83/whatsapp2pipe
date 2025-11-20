using System.Globalization;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

public class DealTransformService
{
    /// <summary>
    /// Transform Pipedrive deals to extension format with enrichment and sorting
    /// </summary>
    public List<Deal> TransformDeals(
        PipedriveDeal[] pipedriveDeals,
        PipedriveStage[] stages,
        PipedrivePipeline[] pipelines)
    {
        // Create lookup maps for fast access
        var stageMap = stages.ToDictionary(s => s.Id);
        var pipelineMap = pipelines.ToDictionary(p => p.Id);

        var deals = new List<Deal>();

        foreach (var pdDeal in pipedriveDeals)
        {
            // Find stage
            if (!stageMap.TryGetValue(pdDeal.StageId, out var stage))
            {
                // Skip deals with invalid stage_id
                continue;
            }

            // Find pipeline
            if (!pipelineMap.TryGetValue(stage.PipelineId, out var pipeline))
            {
                // Skip deals with invalid pipeline_id
                continue;
            }

            deals.Add(new Deal
            {
                Id = pdDeal.Id,
                Title = pdDeal.Title,
                Value = FormatCurrency(pdDeal.Value, pdDeal.Currency),
                Stage = new DealStage
                {
                    Id = stage.Id,
                    Name = stage.Name,
                    Order = stage.OrderNr
                },
                Pipeline = new DealPipeline
                {
                    Id = pipeline.Id,
                    Name = pipeline.Name
                },
                Status = pdDeal.Status,
                LostReason = pdDeal.LostReason,
                UpdateTime = pdDeal.UpdateTime
            });
        }

        // Sort deals: open → won → lost, then by most recently updated
        return SortDeals(deals);
    }

    /// <summary>
    /// Format currency value based on currency code
    /// </summary>
    private string FormatCurrency(decimal value, string currencyCode)
    {
        try
        {
            var culture = GetCultureForCurrency(currencyCode);
            return value.ToString("C", culture);
        }
        catch
        {
            // Fallback: return value with currency code
            return $"{currencyCode} {value:N2}";
        }
    }

    /// <summary>
    /// Get CultureInfo for currency code
    /// </summary>
    private CultureInfo GetCultureForCurrency(string currencyCode)
    {
        return currencyCode.ToUpper() switch
        {
            "USD" => new CultureInfo("en-US"),
            "EUR" => new CultureInfo("de-DE"),
            "GBP" => new CultureInfo("en-GB"),
            "JPY" => new CultureInfo("ja-JP"),
            "CAD" => new CultureInfo("en-CA"),
            "AUD" => new CultureInfo("en-AU"),
            "CHF" => new CultureInfo("de-CH"),
            "CNY" => new CultureInfo("zh-CN"),
            "INR" => new CultureInfo("en-IN"),
            "BRL" => new CultureInfo("pt-BR"),
            _ => CultureInfo.InvariantCulture
        };
    }

    /// <summary>
    /// Sort deals by status (open → won → lost) then by update time (most recent first)
    /// </summary>
    private List<Deal> SortDeals(List<Deal> deals)
    {
        var statusOrder = new Dictionary<string, int>
        {
            { "open", 0 },
            { "won", 1 },
            { "lost", 2 }
        };

        return deals
            .OrderBy(d => statusOrder.ContainsKey(d.Status) ? statusOrder[d.Status] : 999)
            .ThenByDescending(d =>
            {
                // Parse UpdateTime as DateTime for proper sorting
                // Pipedrive uses ISO 8601 format: "2024-01-20 15:30:00"
                if (DateTime.TryParse(d.UpdateTime, out var updateTime))
                {
                    return updateTime;
                }
                // If parsing fails, use DateTime.MinValue to sort to end
                return DateTime.MinValue;
            })
            .ToList();
    }
}
