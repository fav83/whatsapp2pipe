# GET /userConnections

> **Operation ID:** `getUserConnections`
> **Tags:** `UserConnections`

## Get all user connections

Returns data about all connections for the authorized user.

## Responses

**200** - The data of user connections

Response type: `application/json`

```

```

**401** - Unauthorized response

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`error`** (*optional*) - string
  The error message
- **`errorCode`** (*optional*) - integer
  The response error code
```


## Security

- **api_key**
- **oauth2**: base