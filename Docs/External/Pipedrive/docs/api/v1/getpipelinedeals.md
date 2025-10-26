# GET /pipelines/{id}/deals

> **Operation ID:** `getPipelineDeals`
> **Tags:** `Pipelines`

## Get deals in a pipeline

Lists deals in a specific pipeline across all its stages. If no parameters are provided open deals owned by the authorized user will be returned. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Deals#getDeals" target="_blank" rel="noopener noreferrer">GET /api/v2/deals?pipeline_id={id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the pipeline |
| `filter_id` | integer | query | No | If supplied, only deals matching the given filter will be returned |
| `user_id` | integer | query | No | If supplied, `filter_id` will not be considered and only deals owned by the given user will be returned. If omitted, deals owned by the authorized user will be returned. |
| `everyone` | number (`0`, `1`) | query | No | If supplied, `filter_id` and `user_id` will not be considered – instead, deals owned by everyone will be returned |
| `stage_id` | integer | query | No | If supplied, only deals within the given stage will be returned |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `get_summary` | number (`0`, `1`) | query | No | Whether to include a summary of the pipeline in the `additional_data` or not |
| `totals_convert_currency` | string | query | No | The 3-letter currency code of any of the supported currencies. When supplied, `per_stages_converted` is returned inside `deals_summary` inside `additional_data` which contains the currency-converted total amounts in the given currency per each stage. You may also set this parameter to `default_currency` in which case users default currency is used. Only works when `get_summary` parameter flag is enabled. |

## Responses

**200** - Get deals in a stage

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - array of any
  The array of deals
- **`additional_data`** (*optional*) - object
  The additional data of the list
  - **`start`** (*optional*) - integer
    Pagination start
  - **`limit`** (*optional*) - integer
    Items shown per page
  - **`more_items_in_collection`** (*optional*) - boolean
    If there are more list items in the collection than displayed or not
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full