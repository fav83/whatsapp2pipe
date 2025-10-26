# GET /pipelines/{id}

> **Operation ID:** `getPipeline`
> **Tags:** `Pipelines`

## Get one pipeline

Returns data about a specific pipeline.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the pipeline |

## Responses

**200** - Get pipeline

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, admin