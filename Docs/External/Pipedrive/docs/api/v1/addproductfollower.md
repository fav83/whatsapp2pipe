# POST /products/{id}/followers

> **Operation ID:** `addProductFollower`
> **Tags:** `Products`

## Add a follower to a product

Adds a follower to a product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |

## Request Body

Content type: `application/json`

```
- **`user_id`** (**required**) - integer
  The ID of the user
```

## Responses

**201** - Adds a follower to a product

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`user_id`** (*optional*) - integer
    The ID of the user that was added as follower
  - **`id`** (*optional*) - integer
    The ID of the follower
  - **`product_id`** (*optional*) - integer
    The ID of the product
  - **`add_time`** (*optional*) - string
    The follower creation time. Format: YYYY-MM-DD HH:MM:SS
```


## Security

- **api_key**
- **oauth2**: products:full