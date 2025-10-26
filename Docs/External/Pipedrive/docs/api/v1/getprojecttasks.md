# GET /projects/{id}/tasks

> **Operation ID:** `getProjectTasks`
> **Tags:** `Projects`

## Returns project tasks

Returns tasks linked to a specific project.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project |

## Responses

**200** - A list of tasks.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of object
- **`additional_data`** (*optional*) - object
  The additional data of the list
  - **`next_cursor`** (*optional*) - string
    The first item on the next page. The value of the `next_cursor` field will be `null` if you have reached the end of the dataset and there’s no more pages to be returned.
```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full