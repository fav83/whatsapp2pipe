# GET /users/{id}/followers

> **Operation ID:** `getUserFollowers`
> **Tags:** `Users`

## List followers of a user

Lists the followers of a specific user.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the user |

## Responses

**200** - The list of user IDs

Response type: `application/json`

```

```

**403** - Forbidden response

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`error`** (*optional*) - string
  The error message
```


## Security

- **api_key**
- **oauth2**: users:read