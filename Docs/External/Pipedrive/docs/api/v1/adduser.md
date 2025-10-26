# POST /users

> **Operation ID:** `addUser`
> **Tags:** `Users`

## Add a new user

Adds a new user to the company, returns the ID upon success.

## Request Body

Content type: `application/json`

```
- **`email`** (**required**) - string
  The email of the user
- **`access`** (*optional*) - array of object
  The access given to the user. Each item in the array represents access to a specific app. Optionally may include either admin flag or permission set ID to specify which access to give within the app. If both are omitted, the default access for the corresponding app will be used. It requires structure as follows: `[{ app: 'sales', permission_set_id: '62cc4d7f-4038-4352-abf3-a8c1c822b631' }, { app: 'global', admin: true }, { app: 'account_settings' }]`

- **`active_flag`** (*optional*) - boolean
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


## Security

- **api_key**
- **oauth2**: admin