# GET /products/{id}/deals

> **Operation ID:** `getProductDeals`
> **Tags:** `Products`

## Get deals where a product is attached to

Returns data about deals that have a product attached to it.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `status` | string (`open`, `won`, `lost`, ...) | query | No | Only fetch deals with a specific status. If omitted, all not deleted deals are returned. If set to deleted, deals that have been deleted up to 30 days ago will be included. |

## Responses

**200** - The data of deals that have a product attached

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full