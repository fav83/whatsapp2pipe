# DELETE /notes/{id}/comments/{commentId}

> **Operation ID:** `deleteComment`
> **Tags:** `Notes`

## Delete a comment related to a note

Deletes a comment.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the note |
| `commentId` | string | path | Yes | The ID of the comment |

## Responses

**200** - Delete a comment

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