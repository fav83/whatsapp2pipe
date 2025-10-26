# GET /projects/phases

> **Operation ID:** `getProjectsPhases`
> **Tags:** `Projects`

## Get project phases

Returns all active project phases under a specific board.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `board_id` | integer | query | Yes | ID of the board for which phases are requested |

## Responses

**200** - A list of project phases.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of object
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full