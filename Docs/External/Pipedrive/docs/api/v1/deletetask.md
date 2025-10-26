# DELETE /tasks/{id}

> **Operation ID:** `deleteTask`
> **Tags:** `Tasks`

## Delete a task

Marks a task as deleted. If the task has subtasks then those will also be deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the task |

## Responses

**200** - Deleted task.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`success`** (*optional*) - boolean
    If the request was successful or not
  - **`data`** (*optional*) - object
    - **`id`** (*optional*) - integer
      The ID of the task that was deleted
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:full