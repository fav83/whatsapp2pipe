# PUT /projects/{id}/plan/tasks/{taskId}

> **Operation ID:** `putProjectPlanTask`
> **Tags:** `Projects`

## Update task in project plan

Updates a task phase or group in a project.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project |
| `taskId` | integer | path | Yes | The ID of the task |

## Request Body

Content type: `application/json`

```
- **`phase_id`** (*optional*) - number
  The ID of a phase on a project board
- **`group_id`** (*optional*) - number
  The ID of a group on a project board
```

## Responses

**200** - Updated task in plan.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`item_id`** (*optional*) - number
    ID of plan item (either activity or task ID)
  - **`item_type`** (*optional*) - string
    Type of a plan item (task / activity)
  - **`phase_id`** (*optional*) - number
    The ID of the board this project is associated with. If null then plan item is not in any phase.
  - **`group_id`** (*optional*) - number
    The ID of the board this project is associated with. If null then plan item is not in any group.
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:full