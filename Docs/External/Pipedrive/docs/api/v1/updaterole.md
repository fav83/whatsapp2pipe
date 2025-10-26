# PUT /roles/{id}

> **Operation ID:** `updateRole`
> **Tags:** `Roles`

## Update role details

Updates the parent role and/or the name of a specific role.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the role |

## Request Body

Content type: `application/json`

```
- **`parent_role_id`** (*optional*) - integer
  The ID of the parent role
- **`name`** (*optional*) - string
  The name of the role
```

## Responses

**200** - Update role details

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin