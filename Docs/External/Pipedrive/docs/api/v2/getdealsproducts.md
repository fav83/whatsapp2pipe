# GET /deals/products

> **Operation ID:** `getDealsProducts`
> **Tags:** `Deals`

## Get deal products of several deals

Returns data about products attached to deals

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `deal_ids` | array | query | Yes | An array of integers with the IDs of the deals for which the attached products will be returned. A maximum of 100 deal IDs can be provided. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `sort_by` | string (`id`, `deal_id`, `add_time`, ...) | query | No | The field to sort by. Supported fields: `id`, `deal_id`, `add_time`, `update_time`, `order_nr`. |
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