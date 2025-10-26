# POST /products/{id}/followers

> **Operation ID:** `addProductFollower`
> **Tags:** `Products`

## Add a follower to a product

Adds a user as a follower to the product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |

## Request Body

Content type: `application/json`

```
- **`user_id`** (**required**) - integer
  The ID of the user to add as a follower
```

## Responses

**201** - Add a follower

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: products:full