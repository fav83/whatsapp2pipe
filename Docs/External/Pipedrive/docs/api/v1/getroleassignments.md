# GET /roles/{id}/assignments

> **Operation ID:** `getRoleAssignments`
> **Tags:** `Roles`

## List role assignments

Returns all users assigned to a role.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the role |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - List assignments for a role

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin