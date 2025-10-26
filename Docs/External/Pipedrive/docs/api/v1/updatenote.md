# PUT /notes/{id}

> **Operation ID:** `updateNote`
> **Tags:** `Notes`

## Update a note

Updates a note.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the note |

## Request Body

Content type: `application/json`

```

```

## Responses

**200** - Add, update or get a note

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the note
  - **`active_flag`** (*optional*) - boolean
    Whether the note is active or deleted
  - **`add_time`** (*optional*) - string
    The creation date and time of the note
  - **`content`** (*optional*) - string
    The content of the note in HTML format. Subject to sanitization on the back-end.
  - **`deal`** (*optional*) - object
    The deal this note is attached to
    - **`title`** (*optional*) - string
      The title of the deal this note is attached to
  - **`lead_id`** (*optional*) - string
    The ID of the lead the note is attached to
  - **`deal_id`** (*optional*) - integer
    The ID of the deal the note is attached to
  - **`last_update_user_id`** (*optional*) - integer
    The ID of the user who last updated the note
  - **`org_id`** (*optional*) - integer
    The ID of the organization the note is attached to
  - **`organization`** (*optional*) - object
    The organization the note is attached to
    - **`name`** (*optional*) - string
      The name of the organization the note is attached to
  - **`person`** (*optional*) - object
    The person the note is attached to
    - **`name`** (*optional*) - string
      The name of the person the note is attached to
  - **`person_id`** (*optional*) - integer
    The ID of the person the note is attached to
  - **`project_id`** (*optional*) - integer
    The ID of the project the note is attached to
  - **`project`** (*optional*) - object
    The project the note is attached to
    - **`title`** (*optional*) - string
      The title of the project the note is attached to
  - **`pinned_to_deal_flag`** (*optional*) - boolean
    If true, the results are filtered by note to deal pinning state
  - **`pinned_to_organization_flag`** (*optional*) - boolean
    If true, the results are filtered by note to organization pinning state
  - **`pinned_to_person_flag`** (*optional*) - boolean
    If true, the results are filtered by note to person pinning state
  - **`pinned_to_project_flag`** (*optional*) - boolean
    If true, the results are filtered by note to project pinning state
  - **`update_time`** (*optional*) - string
    The last updated date and time of the note
  - **`user`** (*optional*) - object
    The user who created the note
    - **`email`** (*optional*) - string
      The email of the note creator
    - **`icon_url`** (*optional*) - string
      The URL of the note creator avatar picture
    - **`is_you`** (*optional*) - boolean
      Whether the note is created by you or not
    - **`name`** (*optional*) - string
      The name of the note creator
  - **`user_id`** (*optional*) - integer
    The ID of the note creator
```


## Security

- **api_key**
- **oauth2**: deals:full, contacts:full