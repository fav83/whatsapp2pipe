# DELETE /products/{id}/followers/{follower_id}

> **Operation ID:** `deleteProductFollower`
> **Tags:** `Products`

## Delete a follower from a product

Deletes a user follower from the product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |
| `follower_id` | integer | path | Yes | The ID of the following user |

## Responses

**200** - Remove a follower

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`user_id`** (*optional*) - integer
    Deleted follower user ID
```


## Security

- **api_key**
- **oauth2**: products:full