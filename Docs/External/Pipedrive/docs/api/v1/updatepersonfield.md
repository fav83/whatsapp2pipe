# PUT /personFields/{id}

> **Operation ID:** `updatePersonField`
> **Tags:** `PersonFields`

## Update a person field

Updates a person field. For more information, see the tutorial for <a href=" https://pipedrive.readme.io/docs/updating-custom-field-value " target="_blank" rel="noopener noreferrer">updating custom fields' values</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the field |

## Request Body

Content type: `application/json`

```
- **`name`** (*optional*) - string
  The name of the field
- **`options`** (*optional*) - array of object
  When `field_type` is either set or enum, possible options must be supplied as a JSON-encoded sequential array of objects. All active items must be supplied and already existing items must have their ID supplied. New items only require a label. Example: `[{"id":123,"label":"Existing Item"},{"label":"New Item"}]`
- **`add_visible_flag`** (*optional*) - boolean
  Whether the field is available in 'add new' modal or not (both in web and mobile app)
```

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin