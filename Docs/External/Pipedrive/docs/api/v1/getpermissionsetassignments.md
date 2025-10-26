# GET /permissionSets/{id}/assignments

> **Operation ID:** `getPermissionSetAssignments`
> **Tags:** `PermissionSets`

## List permission set assignments

Returns the list of assignments for a permission set.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the permission set |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - The assignments of a specific user ID

Response type: `application/json`

```

```

**404** - If the user ID has no assignments, then it will return NotFound

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin