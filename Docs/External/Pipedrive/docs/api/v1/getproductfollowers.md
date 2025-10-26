# GET /products/{id}/followers

> **Operation ID:** `getProductFollowers`
> **Tags:** `Products`

## List followers of a product

Lists the followers of a product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Lists the followers of a product

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: products:read, products:full