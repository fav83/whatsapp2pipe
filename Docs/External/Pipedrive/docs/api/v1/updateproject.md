# PUT /projects/{id}

> **Operation ID:** `updateProject`
> **Tags:** `Projects`

## Update a project

Updates a project.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project |

## Request Body

Content type: `application/json`

```

```

## Responses

**200** - Updated project.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - any
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:full