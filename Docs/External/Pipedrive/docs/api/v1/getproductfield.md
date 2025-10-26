# GET /productFields/{id}

> **Operation ID:** `getProductField`
> **Tags:** `ProductFields`

## Get one product field

Returns data about a specific product field.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product field |

## Responses

**200** - Get the data for a single product field

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
  All data for the product field
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
- **oauth2**: products:read, products:full