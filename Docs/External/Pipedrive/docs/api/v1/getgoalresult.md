# GET /goals/{id}/results

> **Operation ID:** `getGoalResult`
> **Tags:** `Goals`

## Get result of a goal

Gets the progress of a goal for the specified period.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the goal that the results are looked for |
| `period.start` | string | query | Yes | The start date of the period for which to find the goal's progress. Format: YYYY-MM-DD. This date must be the same or after the goal duration start date.  |
| `period.end` | string | query | Yes | The end date of the period for which to find the goal's progress. Format: YYYY-MM-DD. This date must be the same or before the goal duration end date.  |

## Responses

**200** - Successful response containing payload in the `data.goal` object

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`progress`** (*optional*) - integer
    The numeric progress of the goal
  - **`goal`** (*optional*) - object
    - **`id`** (*optional*) - string
      The ID of the goal
    - **`owner_id`** (*optional*) - integer
      The ID of the creator of the goal
    - **`title`** (*optional*) - string
      The title of the goal
    - **`type`** (*optional*) - object
      The type of the goal
      - **`name`** (*optional*) - string
        The name of the goal type
      - **`params`** (*optional*) - object
        The parameters that accompany the goal type
        - **`pipeline_id`** (*optional*) - array of integer
          The IDs of pipelines of the goal
        - **`activity_type_id`** (*optional*) - array of integer
          The IDs of activity types of the goal
    - **`assignee`** (*optional*) - object
      Who the goal is assigned to
      - **`id`** (*optional*) - integer
        The ID of the goal assignee
      - **`type`** (*optional*) - string
        The type of the assignee
    - **`interval`** (*optional*) - string
      The interval of the goal
    - **`duration`** (*optional*) - object
      The duration of the goal
      - **`start`** (*optional*) - string
        The start date of the goal
      - **`end`** (*optional*) - string
        The end date of the goal
    - **`expected_outcome`** (*optional*) - object
      The expected outcome of the goal
      - **`target`** (*optional*) - integer
        The numeric target of the goal
      - **`tracking_metric`** (*optional*) - string
        The tracking metric of the goal
    - **`is_active`** (*optional*) - boolean
      Whether the goal is currently active or not
    - **`report_ids`** (*optional*) - array of string
      The IDs of the reports that belong to the goal
```


## Security

- **api_key**
- **oauth2**: goals:read, goals:full