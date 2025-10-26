# GET /users/{id}/roleSettings

> **Operation ID:** `getUserRoleSettings`
> **Tags:** `Users`

## List user role settings

Lists the settings of user's assigned role.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the user |

## Responses

**200** - List role settings

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: users:read