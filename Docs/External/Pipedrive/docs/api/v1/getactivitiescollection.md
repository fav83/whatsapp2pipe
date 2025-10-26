# GET /activities/collection

> **Operation ID:** `getActivitiesCollection`
> **Tags:** `Activities`

## Get all activities collection

Returns all activities. Please note that only global admins (those with global permissions) can access this endpoint. Users with regular permissions will receive a 403 response. Read more about global permissions <a href="https://support.pipedrive.com/en/article/global-user-management" target="_blank" rel="noopener noreferrer">here</a>. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Activities#getActivities" target="_blank" rel="noopener noreferrer">GET /api/v2/activities</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `since` | string | query | No | The time boundary that points to the start of the range of data. Datetime in ISO 8601 format. E.g. 2022-11-01 08:55:59. Operates on the `update_time` field. |
| `until` | string | query | No | The time boundary that points to the end of the range of data. Datetime in ISO 8601 format. E.g. 2022-11-01 08:55:59. Operates on the `update_time` field. |
| `user_id` | integer | query | No | The ID of the user whose activities will be fetched. If omitted, all activities are returned. |
| `done` | boolean | query | No | Whether the activity is done or not. `false` = Not done, `true` = Done. If omitted, returns both done and not done activities. |
| `type` | string | query | No | The type of the activity, can be one type or multiple types separated by a comma. This is in correlation with the `key_string` parameter of ActivityTypes. |

## Responses

**200** - A collection of activities

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of any
- **`additional_data`** (*optional*) - object
  The additional data of the list
  - **`next_cursor`** (*optional*) - string
    The first item on the next page. The value of the `next_cursor` field will be `null` if you have reached the end of the dataset and there’s no more pages to be returned.
```

**403** - Forbidden response

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`error`** (*optional*) - string
  The error message
```


## Security

- **api_key**
- **oauth2**: activities:read, activities:full