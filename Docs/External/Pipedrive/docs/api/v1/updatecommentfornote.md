# PUT /notes/{id}/comments/{commentId}

> **Operation ID:** `updateCommentForNote`
> **Tags:** `Notes`

## Update a comment related to a note

Updates a comment related to a note.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the note |
| `commentId` | string | path | Yes | The ID of the comment |

## Request Body

Content type: `application/json`

```
- **`content`** (**required**) - string
  The content of the comment in HTML format. Subject to sanitization on the back-end.
```

## Responses

**200** - Add, update or get a comment

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`uuid`** (*optional*) - string
    The ID of the note
  - **`active_flag`** (*optional*) - boolean
    Whether the note is active or deleted
  - **`add_time`** (*optional*) - string
    The creation date and time of the note
  - **`update_time`** (*optional*) - string
    The creation date and time of the note
  - **`content`** (*optional*) - string
    The content of the note in HTML format. Subject to sanitization on the back-end.
  - **`object_id`** (*optional*) - string
    The ID of the object that the comment is attached to, will be the id of the note
  - **`object_type`** (*optional*) - string
    The type of object that the comment is attached to, will be "note"
  - **`user_id`** (*optional*) - integer
    The ID of the user who created the comment
  - **`updater_id`** (*optional*) - integer
    The ID of the user who last updated the comment
  - **`company_id`** (*optional*) - integer
    The ID of the company
```


## Security

- **api_key**
- **oauth2**: deals:full, contacts:full