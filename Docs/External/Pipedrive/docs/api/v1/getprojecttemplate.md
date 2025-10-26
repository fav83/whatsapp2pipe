# GET /projectTemplates/{id}

> **Operation ID:** `getProjectTemplate`
> **Tags:** `ProjectTemplates`

## Get details of a template

Returns the details of a specific project template.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project template |

## Responses

**200** - Get a project template.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - any
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full