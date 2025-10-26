# DELETE /meetings/userProviderLinks/{id}

> **Operation ID:** `deleteUserProviderLink`
> **Tags:** `Meetings`

## Delete the link between a user and the installed video call integration

A video calling provider must call this endpoint to remove the link between a user and the installed video calling app.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | Unique identifier linking a user to the installed integration |

## Responses

**200** - User provider link successfully removed

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  Boolean that indicates whether the request was successful or not
- **`data`** (*optional*) - object
  - **`message`** (*optional*) - string
    The success message of the request
```

**401** - No permission to remove user provider link

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  Boolean that indicates whether the request was successful or not
- **`message`** (*optional*) - string
  The error message of the request
```

**403** - Incorrect parameter provided

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  Boolean that indicates whether the request was successful or not
- **`message`** (*optional*) - string
  The error message of the request
```


## Security

- **api_key**
- **oauth2**: video-calls