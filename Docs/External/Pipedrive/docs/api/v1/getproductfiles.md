# GET /products/{id}/files

> **Operation ID:** `getProductFiles`
> **Tags:** `Products`

## List files attached to a product

Lists files associated with a product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page. Please note that a maximum value of 100 is allowed. |
| `sort` | string | query | No | Supported fields: `id`, `update_time` |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: products:read, products:full