# GET /permissionSets/{id}

> **Operation ID:** `getPermissionSet`
> **Tags:** `PermissionSets`

## Get one permission set

Returns data about a specific permission set.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the permission set |

## Responses

**200** - The permission set of a specific user ID

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