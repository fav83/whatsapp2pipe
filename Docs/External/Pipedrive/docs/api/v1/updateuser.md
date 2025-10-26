# PUT /users/{id}

> **Operation ID:** `updateUser`
> **Tags:** `Users`

## Update user details

Updates the properties of a user. Currently, only `active_flag` can be updated.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the user |

## Request Body

Content type: `application/json`

```
- **`active_flag`** (**required**) - boolean
  Whether the user is active or not. `false` = Not activated, `true` = Activated
```

## Responses

**200** - The data of the user

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
- **oauth2**: admin