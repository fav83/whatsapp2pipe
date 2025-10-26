# PUT /productFields/{id}

> **Operation ID:** `updateProductField`
> **Tags:** `ProductFields`

## Update a product field

Updates a product field. For more information, see the tutorial for <a href=" https://pipedrive.readme.io/docs/updating-custom-field-value " target="_blank" rel="noopener noreferrer">updating custom fields' values</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product field |

## Request Body

Content type: `application/json`

```
- **`name`** (*optional*) - string
  The name of the field
- **`options`** (*optional*) - array of object
  When `field_type` is either set or enum, possible options on update must be supplied as an array of objects each containing id and label, for example: [{"id":1, "label":"red"},{"id":2, "label":"blue"},{"id":3, "label":"lilac"}]
```

## Responses

**200** - Get the data for a single product field

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
  All data for the product field
```


## Security

- **api_key**
- **oauth2**: products:full