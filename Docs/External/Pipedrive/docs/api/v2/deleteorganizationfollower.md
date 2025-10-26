# DELETE /organizations/{id}/followers/{follower_id}

> **Operation ID:** `deleteOrganizationFollower`
> **Tags:** `Organizations`

## Delete a follower from an organization

Deletes a user follower from the organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |
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
- **oauth2**: contacts:full