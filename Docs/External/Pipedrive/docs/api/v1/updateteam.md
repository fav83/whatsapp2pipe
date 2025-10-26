# PUT /legacyTeams/{id}

> **Operation ID:** `updateTeam`
> **Tags:** `LegacyTeams`

## Update a team

Updates an existing team and returns the updated object.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the team |

## Request Body

Content type: `application/json`

```

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