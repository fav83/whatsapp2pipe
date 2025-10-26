# DELETE /deals/{id}/followers/{follower_id}

> **Operation ID:** `deleteDealFollower`
> **Tags:** `Deals`

## Delete a follower from a deal

Deletes a user follower from the deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
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
- **oauth2**: deals:full