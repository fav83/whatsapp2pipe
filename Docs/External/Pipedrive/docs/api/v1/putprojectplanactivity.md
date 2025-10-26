# PUT /projects/{id}/plan/activities/{activityId}

> **Operation ID:** `putProjectPlanActivity`
> **Tags:** `Projects`

## Update activity in project plan

Updates an activity phase or group in a project.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project |
| `activityId` | integer | path | Yes | The ID of the activity |

## Request Body

Content type: `application/json`

```
- **`phase_id`** (*optional*) - number
  The ID of a phase on a project board
- **`group_id`** (*optional*) - number
  The ID of a group on a project board
```

## Responses

**200** - Updated activity in plan.

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