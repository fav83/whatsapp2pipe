# GET /legacyTeams/{id}

> **Operation ID:** `getTeam`
> **Tags:** `LegacyTeams`

## Get a single team

Returns data about a specific team.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the team |
| `skip_users` | number (`0`, `1`) | query | No | When enabled, the teams will not include IDs of member users |

## Responses

**200** - The team data

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