# POST /deals/{id}/followers

> **Operation ID:** `addDealFollower`
> **Tags:** `Deals`

## Add a follower to a deal

Adds a user as a follower to the deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

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
- **oauth2**: deals:full