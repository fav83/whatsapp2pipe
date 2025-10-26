# GET /users/{id}

> **Operation ID:** `getUser`
> **Tags:** `Users`

## Get one user

Returns data about a specific user within the company.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the user |

## Responses

**200** - The data of the user

Response type: `application/json`

```

```

**404** - User with specified ID does not exist or is inaccessible

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