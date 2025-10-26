# PUT /stages/{id}

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

```

## Responses

**200** - Get all stages

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  Updated stage object
  - **`id`** (*optional*) - integer
    The ID of the stage
  - **`order_nr`** (*optional*) - integer
    Defines the order of the stage
  - **`name`** (*optional*) - string
    The name of the stage
  - **`active_flag`** (*optional*) - boolean
    Whether the stage is active or deleted
  - **`deal_probability`** (*optional*) - integer
    The success probability percentage of the deal. Used/shown when the deal weighted values are used.
  - **`pipeline_id`** (*optional*) - integer
    The ID of the pipeline to add the stage to
  - **`rotten_flag`** (*optional*) - boolean
    Whether deals in this stage can become rotten
  - **`rotten_days`** (*optional*) - integer
    The number of days the deals not updated in this stage would become rotten. Applies only if the `rotten_flag` is set.
  - **`add_time`** (*optional*) - string
    The stage creation time. Format: YYYY-MM-DD HH:MM:SS.
  - **`update_time`** (*optional*) - string
    The stage update time. Format: YYYY-MM-DD HH:MM:SS.
```


## Security

- **api_key**
- **oauth2**: admin