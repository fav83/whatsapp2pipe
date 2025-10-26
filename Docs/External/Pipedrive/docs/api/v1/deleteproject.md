# DELETE /projects/{id}

> **Operation ID:** `deleteProject`
> **Tags:** `Projects`

## Delete a project

Marks a project as deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project |

## Responses

**200** - Delete a project.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`success`** (*optional*) - boolean
    If the request was successful or not
  - **`data`** (*optional*) - object
    - **`id`** (*optional*) - integer
      The ID of the project that was deleted
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:full