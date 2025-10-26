# POST /roles/{id}/assignments

> **Operation ID:** `addRoleAssignment`
> **Tags:** `Roles`

## Add role assignment

Assigns a user to a role.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the role |

## Request Body

Content type: `application/json`

```
- **`user_id`** (**required**) - integer
  The ID of the user
```

## Responses

**200** - Add assignment for a role

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin