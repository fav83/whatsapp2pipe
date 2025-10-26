# GET /notes/{id}/comments

> **Operation ID:** `getNoteComments`
> **Tags:** `Notes`

## Get all comments for a note

Returns all comments associated with a note.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the note |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Get all comments

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - array of object
  The array of comments
- **`additional_data`** (*optional*) - object
  - **`pagination`** (*optional*) - object
    The pagination details of the list
    - **`next_start`** (*optional*) - integer
      Next pagination start
    - **`start`** (*optional*) - integer
      Pagination start
    - **`limit`** (*optional*) - integer
      Items shown per page
    - **`more_items_in_collection`** (*optional*) - boolean
      If there are more list items in the collection than displayed or not
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, contacts:read, contacts:full