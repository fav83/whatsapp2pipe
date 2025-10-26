# GET /users/{id}/permissions

> **Operation ID:** `getUserPermissions`
> **Tags:** `Users`

## List user permissions

Lists aggregated permissions over all assigned permission sets for a user.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the user |

## Responses

**200** - The list of user permissions

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: users:read