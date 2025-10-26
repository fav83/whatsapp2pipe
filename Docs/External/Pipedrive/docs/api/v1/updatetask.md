# PUT /tasks/{id}

> **Operation ID:** `updateTask`
> **Tags:** `Tasks`

## Update a task

Updates a task.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the task |

## Request Body

Content type: `application/json`

```

```

## Responses

**200** - Updated task.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object

- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:full