# GET /userSettings

> **Operation ID:** `getUserSettings`
> **Tags:** `UserSettings`

## List settings of an authorized user

Lists the settings of an authorized user. Example response contains a shortened list of settings.

## Responses

**200** - The list of user settings

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