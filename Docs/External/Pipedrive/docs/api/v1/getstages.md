# GET /stages

> **Operation ID:** `getStages`
> **Tags:** `Stages`

## Get all stages

Returns data about all stages.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `pipeline_id` | integer | query | No | The ID of the pipeline to fetch stages for. If omitted, stages for all pipelines will be fetched. |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Get all stages

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - array of any
  The array of stages
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, admin