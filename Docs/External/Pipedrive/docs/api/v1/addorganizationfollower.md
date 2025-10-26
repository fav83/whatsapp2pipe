# POST /organizations/{id}/followers

> **Operation ID:** `addOrganizationFollower`
> **Tags:** `Organizations`

## Add a follower to an organization

Adds a follower to an organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |

## Request Body

Content type: `application/json`

```
- **`user_id`** (**required**) - integer
  The ID of the user
```

## Responses

**200** - Success

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - any
```


## Security

- **api_key**
- **oauth2**: contacts:full