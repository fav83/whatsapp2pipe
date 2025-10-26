# GET /tasks

> **Operation ID:** `getTasks`
> **Tags:** `Tasks`

## Get all tasks

Returns all tasks. This is a cursor-paginated endpoint. For more information, please refer to our documentation on <a href="https://pipedrive.readme.io/docs/core-api-concepts-pagination" target="_blank" rel="noopener noreferrer">pagination</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, up to 500 items will be returned. |
| `assignee_id` | integer | query | No | If supplied, only tasks that are assigned to this user are returned |
| `project_id` | integer | query | No | If supplied, only tasks that are assigned to this project are returned |
| `parent_task_id` | integer | query | No | If `null` is supplied then only parent tasks are returned. If integer is supplied then only subtasks of a specific task are returned. By default all tasks are returned. |
| `done` | number (`0`, `1`) | query | No | Whether the task is done or not. `0` = Not done, `1` = Done. If not omitted then returns both done and not done tasks. |

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