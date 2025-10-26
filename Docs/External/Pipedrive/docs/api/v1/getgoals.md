# GET /goals/find

> **Operation ID:** `getGoals`
> **Tags:** `Goals`

## Find goals

Returns data about goals based on criteria. For searching, append `{searchField}={searchValue}` to the URL, where `searchField` can be any one of the lowest-level fields in dot-notation (e.g. `type.params.pipeline_id`; `title`). `searchValue` should be the value you are looking for on that field. Additionally, `is_active=<true|false>` can be provided to search for only active/inactive goals. When providing `period.start`, `period.end` must also be provided and vice versa.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `type.name` | string (`deals_won`, `deals_progressed`, `activities_completed`, ...) | query | No | The type of the goal. If provided, everyone's goals will be returned. |
| `title` | string | query | No | The title of the goal |
| `is_active` | boolean | query | No | Whether the goal is active or not |
| `assignee.id` | integer | query | No | The ID of the user who's goal to fetch. When omitted, only your goals will be returned. |
| `assignee.type` | string (`person`, `company`, `team`) | query | No | The type of the goal's assignee. If provided, everyone's goals will be returned. |
| `expected_outcome.target` | number | query | No | The numeric value of the outcome. If provided, everyone's goals will be returned. |
| `expected_outcome.tracking_metric` | string (`quantity`, `sum`) | query | No | The tracking metric of the expected outcome of the goal. If provided, everyone's goals will be returned. |
| `expected_outcome.currency_id` | integer | query | No | The numeric ID of the goal's currency. Only applicable to goals with `expected_outcome.tracking_metric` with value `sum`. If provided, everyone's goals will be returned. |
| `type.params.pipeline_id` | array | query | No | An array of pipeline IDs or `null` for all pipelines. If provided, everyone's goals will be returned. |
| `type.params.stage_id` | integer | query | No | The ID of the stage. Applicable to only `deals_progressed` type of goals. If provided, everyone's goals will be returned. |
| `type.params.activity_type_id` | array | query | No | An array of IDs or `null` for all activity types. Only applicable for `activities_completed` and/or `activities_added` types of goals. If provided, everyone's goals will be returned. |
| `period.start` | string | query | No | The start date of the period for which to find goals. Date in format of YYYY-MM-DD. When `period.start` is provided, `period.end` must be provided too. |
| `period.end` | string | query | No | The end date of the period for which to find goals. Date in format of YYYY-MM-DD. |

## Responses

**200** - Successful response containing payload in the `data.goal` object

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`goals`** (*optional*) - array of object
```


## Security

- **api_key**
- **oauth2**: goals:read, goals:full