# GET /stages

> **Operation ID:** `getStages`
> **Tags:** `Stages`

## Get all stages

Returns data about all stages.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `pipeline_id` | integer | query | No | The ID of the pipeline to fetch stages for. If omitted, stages for all pipelines will be fetched. |
| `sort_by` | string (`id`, `update_time`, `add_time`, ...) | query | No | The field to sort by. Supported fields: `id`, `update_time`, `add_time`, `order_nr`. |
| `sort_direction` | string (`asc`, `desc`) | query | No | The sorting direction. Supported values: `asc`, `desc`. |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - Get all stages

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of object
  The array of stages
- **`additional_data`** (*optional*) - object
  The additional data of the list
  - **`next_cursor`** (*optional*) - string
    The first item on the next page. The value of the `next_cursor` field will be `null` if you have reached the end of the dataset and there’s no more pages to be returned.
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, admin