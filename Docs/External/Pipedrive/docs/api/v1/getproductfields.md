# GET /productFields

> **Operation ID:** `getProductFields`
> **Tags:** `ProductFields`

## Get all product fields

Returns data about all product fields.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Get data about all product fields

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of object
  Array containing data for all product fields
- **`additional_data`** (*optional*) - object
  Additional data for the product field, such as pagination

```


## Security

- **api_key**
- **oauth2**: products:read, products:full