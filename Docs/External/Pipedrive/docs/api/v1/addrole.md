# POST /roles

> **Operation ID:** `addRole`
> **Tags:** `Roles`

## Add a role

Adds a new role.

## Request Body

Content type: `application/json`

```
- **`name`** (**required**) - string
  The name of the role
- **`parent_role_id`** (*optional*) - integer
  The ID of the parent role
```

## Responses

**200** - Add a role

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin