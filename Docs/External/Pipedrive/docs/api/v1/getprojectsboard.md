# GET /projects/boards/{id}

> **Operation ID:** `getProjectsBoard`
> **Tags:** `ProjectTemplates`

## Get details of a board

Returns the details of a specific project board.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project board |

## Responses

**200** - Get a project board.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the project board
  - **`name`** (*optional*) - string
    Name of a project board
  - **`order_nr`** (*optional*) - number
    The order of a board
  - **`add_time`** (*optional*) - string
    The creation date and time of the board in UTC. Format: YYYY-MM-DD HH:MM:SS.
  - **`update_time`** (*optional*) - string
    The update date and time of the board in UTC. Format: YYYY-MM-DD HH:MM:SS.
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full