# GET /projects/boards

> **Operation ID:** `getProjectsBoards`
> **Tags:** `Projects`

## Get all project boards

Returns all projects boards that are not deleted.

## Responses

**200** - A list of project board.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of object
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full