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

**200** - The activity was successfully deleted

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the activity that was deleted
```


## Security

- **api_key**
- **oauth2**: activities:full