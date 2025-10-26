# DELETE /products/{id}/images

> **Operation ID:** `deleteProductImage`
> **Tags:** `Products`, `Beta`

## Delete an image of a product

Deletes the image of a product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |

## Responses

**200** - The ID of the deleted product image.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the image that was deleted from the product.
```


## Security

- **api_key**
- **oauth2**: products:full