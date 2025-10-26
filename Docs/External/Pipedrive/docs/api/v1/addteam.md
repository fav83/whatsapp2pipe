# POST /legacyTeams

> **Operation ID:** `addTeam`
> **Tags:** `LegacyTeams`

## Add a new team

Adds a new team to the company and returns the created object.

## Request Body

Content type: `application/json`

```
- **`name`** (**required**) - string
  The team name
- **`description`** (*optional*) - string
  The team description
- **`manager_id`** (**required**) - integer
  The team manager ID
- **`users`** (*optional*) - array of integer
  The list of user IDs
```

## Responses

**200** - The team data

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