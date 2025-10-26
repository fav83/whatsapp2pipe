# DELETE /productFields/{id}

> **Operation ID:** `deleteProductField`
> **Tags:** `ProductFields`

## Delete a product field

Marks a product field as deleted. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/deleting-a-custom-field" target="_blank" rel="noopener noreferrer">deleting a custom field</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product field |

## Responses

**200** - Delete a product field

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - any
    The ID of the deleted product field
```

**410** - The product field with the specified ID does not exist or is inaccessible

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`error`** (*optional*) - string
  The error message
```


## Security

- **api_key**
- **oauth2**: products:full