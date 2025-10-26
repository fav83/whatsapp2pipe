# GET /projects/{id}/groups

> **Operation ID:** `getProjectGroups`
> **Tags:** `Projects`

## Returns project groups

Returns all active groups under a specific project.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project |

## Responses

**200** - Get a project groups.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of object
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full