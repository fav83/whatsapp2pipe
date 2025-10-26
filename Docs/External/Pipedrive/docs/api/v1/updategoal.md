# PUT /goals/{id}

> **Operation ID:** `updateGoal`
> **Tags:** `Goals`

## Update existing goal

Updates an existing goal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the goal |

## Request Body

Content type: `application/json`

```
- **`title`** (*optional*) - string
  The title of the goal
- **`assignee`** (*optional*) - object
  Who this goal is assigned to. It requires the following JSON structure: `{ "id": "1", "type": "person" }`. `type` can be either `person`, `company` or `team`. ID of the assignee person, company or team.

- **`type`** (*optional*) - object
  The type of the goal. It requires the following JSON structure: `{ "name": "deals_started", "params": { "pipeline_id": [1, 2], "activity_type_id": [9] } }`. Type can be one of: `deals_won`, `deals_progressed`, `activities_completed`, `activities_added`, `deals_started` or `revenue_forecast`. `params` can include `pipeline_id`, `stage_id` or `activity_type_id`. `stage_id` is related to only `deals_progressed` type of goals and `activity_type_id` to `activities_completed` or `activities_added` types of goals. The `pipeline_id` and `activity_type_id` need to be given as an array of integers. To track the goal in all pipelines, set `pipeline_id` as `null` and similarly, to track the goal for all activities, set `activity_type_id` as `null`.”

- **`expected_outcome`** (*optional*) - object
  The expected outcome of the goal. Expected outcome can be tracked either by `quantity` or by `sum`. It requires the following JSON structure: `{ "target": "50", "tracking_metric": "quantity" }` or `{ "target": "50", "tracking_metric": "sum", "currency_id": 1 }`. `currency_id` should only be added to `sum` type of goals.

- **`duration`** (*optional*) - object
  The date when the goal starts and ends. It requires the following JSON structure: `{ "start": "2019-01-01", "end": "2022-12-31" }`. Date in format of YYYY-MM-DD. "end" can be set to `null` for an infinite, open-ended goal.

- **`interval`** (*optional*) - string
  The interval of the goal
  Allowed values: `weekly`, `monthly`, `quarterly`, `yearly`
```

## Responses

**200** - Successful response containing payload in the `data.goal` object

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
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
- **oauth2**: goals:full