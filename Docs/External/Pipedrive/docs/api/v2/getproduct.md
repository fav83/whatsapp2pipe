# GET /products/{id}

> **Operation ID:** `getProduct`
> **Tags:** `Products`

## Get one product

Returns data about a specific product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |

## Responses

**200** - Get product information by id

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
```


## Security

- **api_key**
- **oauth2**: products:read, products:full