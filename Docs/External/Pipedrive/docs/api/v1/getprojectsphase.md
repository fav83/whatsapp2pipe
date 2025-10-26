# GET /projects/phases/{id}

> **Operation ID:** `getProjectsPhase`
> **Tags:** `ProjectTemplates`

## Get details of a phase

Returns the details of a specific project phase.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project phase |

## Responses

**200** - Get a project phase.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the project phase
  - **`name`** (*optional*) - string
    Name of a project phase
  - **`board_id`** (*optional*) - number
    The ID of the project board this phase is linked to
  - **`order_nr`** (*optional*) - number
    The order of a phase
  - **`add_time`** (*optional*) - string
    The creation date and time of the board in UTC. Format: YYYY-MM-DD HH:MM:SS.
  - **`update_time`** (*optional*) - string
    The update date and time of the board in UTC. Format: YYYY-MM-DD HH:MM:SS.
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:read