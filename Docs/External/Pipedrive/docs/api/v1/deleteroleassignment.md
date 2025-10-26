# DELETE /roles/{id}/assignments

> **Operation ID:** `deleteRoleAssignment`
> **Tags:** `Roles`

## Delete a role assignment

Removes the assigned user from a role and adds to the default role.

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

**200** - Delete assignment from a role

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin