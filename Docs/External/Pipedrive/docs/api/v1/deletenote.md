# DELETE /notes/{id}

> **Operation ID:** `deleteNote`
> **Tags:** `Notes`

## Delete a note

Deletes a specific note.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the note |

## Responses

**200** - Delete a note

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - boolean
  If the response is successful or not
```


## Security

- **api_key**
- **oauth2**: deals:full, contacts:full