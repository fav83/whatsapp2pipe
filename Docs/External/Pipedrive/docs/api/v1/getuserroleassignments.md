# GET /users/{id}/roleAssignments

> **Operation ID:** `getUserRoleAssignments`
> **Tags:** `Users`

## List role assignments

Lists role assignments for a user.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the user |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - List assignments for a role

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: users:read