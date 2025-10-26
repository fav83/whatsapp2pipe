# DELETE /products/{id}/variations/{product_variation_id}

> **Operation ID:** `deleteProductVariation`
> **Tags:** `Products`

## Delete a product variation

Deletes a product variation.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |
| `product_variation_id` | integer | path | Yes | The ID of the product variation |

## Responses

**200** - Delete a product variation

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of a deleted product variant
```


## Security

- **api_key**
- **oauth2**: products:full