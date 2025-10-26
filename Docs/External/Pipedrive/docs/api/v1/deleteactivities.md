# DELETE /activities

> **Operation ID:** `deleteActivities`
> **Tags:** `Activities`

## Delete multiple activities in bulk

Marks multiple activities as deleted. After 30 days, the activities will be permanently deleted. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Activities#deleteActivity" target="_blank" rel="noopener noreferrer">DELETE /api/v2/activities/{id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `ids` | string | query | Yes | The comma-separated IDs of activities that will be deleted |

## Responses

**200** - The activities were successfully deleted

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - array of integer
    An array of the IDs of activities that were deleted
```


## Security

- **api_key**
- **oauth2**: activities:full