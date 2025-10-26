# DELETE /stages/{id}

> **Operation ID:** `deleteStage`
> **Tags:** `Stages`

## Delete a stage

Marks a stage as deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the stage |

## Responses

**200** - Delete stage

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    Deleted stage ID
```


## Security

- **api_key**
- **oauth2**: admin