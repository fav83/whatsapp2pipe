# GET /legacyTeams/{id}/users

> **Operation ID:** `getTeamUsers`
> **Tags:** `LegacyTeams`

## Get all users in a team

Returns a list of all user IDs within a team.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the team |

## Responses

**200** - A list of user IDs within a team

Response type: `application/json`

```

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
- **oauth2**: users:read