# GET /deals/{id}/products

> **Operation ID:** `getDealProducts`
> **Tags:** `Deals`

## List products attached to a deal

Lists products attached to a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `include_product_data` | number (`0`, `1`) | query | No | Whether to fetch product data along with each attached product (1) or not (0, default) |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: products:read, products:full