# GET /tasks/{id}

> **Operation ID:** `getTask`
> **Tags:** `Tasks`

## Get details of a task

Returns the details of a specific task.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the task |

## Responses

**200** - Get a task.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object

- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full