# DELETE /goals/{id}

> **Operation ID:** `deleteGoal`
> **Tags:** `Goals`

## Delete existing goal

Marks a goal as deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the goal |

## Responses

**200** - Successful response with id 'success' field only

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
```


## Security

- **api_key**
- **oauth2**: goals:full