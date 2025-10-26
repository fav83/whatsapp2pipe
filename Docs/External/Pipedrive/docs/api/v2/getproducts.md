# GET /products

> **Operation ID:** `getProducts`
> **Tags:** `Products`

## Get all products

Returns data about all products.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `owner_id` | integer | query | No | If supplied, only products owned by the given user will be returned |
| `ids` | string | query | No | Optional comma separated string array of up to 100 entity ids to fetch. If filter_id is provided, this is ignored. If any of the requested entities do not exist or are not visible, they are not included in the response. |
| `filter_id` | integer | query | No | The ID of the filter to use |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `sort_by` | string (`id`, `name`, `add_time`, ...) | query | No | The field to sort by. Supported fields: `id`, `name`, `add_time`, `update_time`. |
| `sort_direction` | string (`asc`, `desc`) | query | No | The sorting direction. Supported values: `asc`, `desc`. |
| `custom_fields` | string | query | No | Comma separated string array of custom fields keys to include. If you are only interested in a particular set of custom fields, please use this parameter for a smaller response.<br/>A maximum of 15 keys is allowed. |

## Responses

**200** - List of products

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of object
  Array containing data for all products
- **`additional_data`** (*optional*) - object
  Pagination related data
  - **`next_cursor`** (*optional*) - string
    The first item on the next page. The value of the `next_cursor` field will be `null` if you have reached the end of the dataset and there’s no more pages to be returned.
```


## Security

- **api_key**
- **oauth2**: products:read, products:full