# GET /pipelines/{id}/conversion_statistics

> **Operation ID:** `getPipelineConversionStatistics`
> **Tags:** `Pipelines`

## Get deals conversion rates in pipeline

Returns all stage-to-stage conversion and pipeline-to-close rates for the given time period.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the pipeline |
| `start_date` | string | query | Yes | The start of the period. Date in format of YYYY-MM-DD. |
| `end_date` | string | query | Yes | The end of the period. Date in format of YYYY-MM-DD. |
| `user_id` | integer | query | No | The ID of the user who's pipeline metrics statistics to fetch. If omitted, the authorized user will be used. |

## Responses

**200** - Get pipeline deals conversion rates

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full