# GET /products/{id}/permittedUsers

> **Operation ID:** `getProductUsers`
> **Tags:** `Products`

## List permitted users

Lists users permitted to access a product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |

## Responses

**200** - Lists users permitted to access a product

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: products:read, products:full