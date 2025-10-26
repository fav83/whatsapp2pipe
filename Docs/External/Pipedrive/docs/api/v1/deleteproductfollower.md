# DELETE /products/{id}/followers/{follower_id}

> **Operation ID:** `deleteProductFollower`
> **Tags:** `Products`

## Delete a follower from a product

Deletes a follower from a product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |
| `follower_id` | integer | path | Yes | The ID of the relationship between the follower and the product |

## Responses

**200** - Deletes a follower from a product

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - any
    The ID of the removed follower
```


## Security

- **api_key**
- **oauth2**: products:full