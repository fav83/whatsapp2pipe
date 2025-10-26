# GET /projects/{id}

> **Operation ID:** `getProject`
> **Tags:** `Projects`

## Get details of a project

Returns the details of a specific project. Also note that custom fields appear as long hashes in the resulting data. These hashes can be mapped against the `key` value of project fields.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project |

## Responses

**200** - Get a project.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - any
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full