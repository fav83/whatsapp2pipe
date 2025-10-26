# DELETE /persons/{id}

> **Operation ID:** `deletePerson`
> **Tags:** `Persons`

## Delete a person

Marks a person as deleted. After 30 days, the person will be permanently deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |

## Responses

**200** - Delete person

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    Deleted person ID
```


## Security

- **api_key**
- **oauth2**: contacts:full