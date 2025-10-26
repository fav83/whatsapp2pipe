# PATCH /stages/{id}

> **Operation ID:** `updateStage`
> **Tags:** `Stages`

## Update stage details

Updates the properties of a stage.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the stage |

## Request Body

Content type: `application/json`

```
- **`name`** (*optional*) - string
  The name of the stage
- **`pipeline_id`** (*optional*) - integer
  The ID of the pipeline to add stage to
- **`deal_probability`** (*optional*) - integer
  The success probability percentage of the deal. Used/shown when deal weighted values are used.
- **`is_deal_rot_enabled`** (*optional*) - boolean
  Whether deals in this stage can become rotten
- **`days_to_rotten`** (*optional*) - integer
  The number of days the deals not updated in this stage would become rotten. Applies only if the `is_deal_rot_enabled` is set.
```

## Responses

**200** - Update an existing stage

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  The stage object
  - **`id`** (*optional*) - integer
    The ID of the stage
  - **`order_nr`** (*optional*) - integer
    Defines the order of the stage
  - **`name`** (*optional*) - string
    The name of the stage
  - **`is_deleted`** (*optional*) - boolean
    Whether the stage is marked as deleted or not
  - **`deal_probability`** (*optional*) - integer
    The success probability percentage of the deal. Used/shown when the deal weighted values are used.
  - **`pipeline_id`** (*optional*) - integer
    The ID of the pipeline to add the stage to
  - **`is_deal_rot_enabled`** (*optional*) - boolean
    Whether deals in this stage can become rotten
  - **`days_to_rotten`** (*optional*) - integer
    The number of days the deals not updated in this stage would become rotten. Applies only if the `is_deal_rot_enabled` is set.
  - **`add_time`** (*optional*) - string
    The stage creation time
  - **`update_time`** (*optional*) - string
    The stage update time
```


## Security

- **api_key**
- **oauth2**: admin