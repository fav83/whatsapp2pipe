# POST /legacyTeams/{id}/users

> **Operation ID:** `addTeamUser`
> **Tags:** `LegacyTeams`

## Add users to a team

Adds users to an existing team.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the team |

## Request Body

Content type: `application/json`

```
- **`users`** (**required**) - array of integer
  The list of user IDs
```

## Responses

**200** - A list of user IDs within a team

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

**404** - Team with specified ID does not exist or is inaccessible

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