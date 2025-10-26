# POST /projects/{id}/archive

> **Operation ID:** `archiveProject`
> **Tags:** `Projects`

## Archive a project

Archives a project.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project |

## Responses

**200** - Updated project.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - any
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:full