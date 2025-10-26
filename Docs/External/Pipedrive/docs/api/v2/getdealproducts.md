# GET /deals/{id}/products

> **Operation ID:** `getDealProducts`
> **Tags:** `Deals`

## List products attached to a deal

Lists products attached to a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `sort_by` | string (`id`, `add_time`, `update_time`, ...) | query | No | The field to sort by. Supported fields: `id`, `add_time`, `update_time`, `order_nr`. |
| `sort_direction` | string (`asc`, `desc`) | query | No | The sorting direction. Supported values: `asc`, `desc`. |

## Responses

**200** - List of products attached to deals

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of any
  Array containing data for all products attached to deals
- **`additional_data`** (*optional*) - object
  Pagination related data
  - **`next_cursor`** (*optional*) - string
    The first item on the next page. The value of the `next_cursor` field will be `null` if you have reached the end of the dataset and there’s no more pages to be returned.
```


## Security

- **api_key**
- **oauth2**: products:read, products:full, deals:read, deals:full