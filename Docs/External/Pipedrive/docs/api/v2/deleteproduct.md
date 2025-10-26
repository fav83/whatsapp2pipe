# DELETE /products/{id}

> **Operation ID:** `deleteProduct`
> **Tags:** `Products`

## Delete a product

Marks a product as deleted. After 30 days, the product will be permanently deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |

## Responses

**200** - Deletes a product

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the removed product
```


## Security

- **api_key**
- **oauth2**: products:full