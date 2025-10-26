# DELETE /organizations/{id}/followers/{follower_id}

> **Operation ID:** `deleteOrganizationFollower`
> **Tags:** `Organizations`

## Delete a follower from an organization

Deletes a follower from an organization. You can retrieve the `follower_id` from the <a href="https://developers.pipedrive.com/docs/api/v1/Organizations#getOrganizationFollowers">List followers of an organization</a> endpoint.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |
| `follower_id` | integer | path | Yes | The ID of the relationship between the follower and the organization |

## Responses

**200** - Success

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the follower that was deleted from the organization
```


## Security

- **api_key**
- **oauth2**: contacts:full