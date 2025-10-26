# DELETE /deals/{id}/followers/{follower_id}

> **Operation ID:** `deleteDealFollower`
> **Tags:** `Deals`

## Delete a follower from a deal

Deletes a follower from a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `follower_id` | integer | path | Yes | The ID of the relationship between the follower and the deal |

## Responses

**200** - Delete a follower from a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the deal follower that was deleted
```


## Security

- **api_key**
- **oauth2**: deals:full