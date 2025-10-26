# DELETE /activities/{id}

> **Operation ID:** `deleteActivity`
> **Tags:** `Activities`

## Delete an activity

Marks an activity as deleted. After 30 days, the activity will be permanently deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the activity |

## Responses

**200** - Delete activity

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    Deleted activity ID
```


## Security

- **api_key**
- **oauth2**: activities:full