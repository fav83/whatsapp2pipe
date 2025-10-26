# GET /pipelines

> **Operation ID:** `getPipelines`
> **Tags:** `Pipelines`

## Get all pipelines

Returns data about all pipelines.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `sort_by` | string (`id`, `update_time`, `add_time`) | query | No | The field to sort by. Supported fields: `id`, `update_time`, `add_time`. |
| `sort_direction` | string (`asc`, `desc`) | query | No | The sorting direction. Supported values: `asc`, `desc`. |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - Get all pipelines

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, admin