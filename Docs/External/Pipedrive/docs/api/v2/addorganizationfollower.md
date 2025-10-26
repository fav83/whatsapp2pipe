# POST /organizations/{id}/followers

> **Operation ID:** `addOrganizationFollower`
> **Tags:** `Organizations`

## Add a follower to an organization

Adds a user as a follower to the organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |

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
- **oauth2**: contacts:full