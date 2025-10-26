# POST /deals/{id}/followers

> **Operation ID:** `addDealFollower`
> **Tags:** `Deals`

## Add a follower to a deal

Adds a follower to a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Request Body

Content type: `application/json`

```
- **`user_id`** (**required**) - integer
  The ID of the user
```

## Responses

**200** - Add a follower to a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`user_id`** (*optional*) - integer
    The user ID who added the follower
  - **`id`** (*optional*) - integer
    The follower ID
  - **`deal_id`** (*optional*) - integer
    The ID of the deal which the follower was added to
  - **`add_time`** (*optional*) - string
    The date and time when the deal follower was added
```


## Security

- **api_key**
- **oauth2**: deals:full