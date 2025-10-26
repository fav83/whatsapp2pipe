# PATCH /products/{id}

> **Operation ID:** `updateProduct`
> **Tags:** `Products`

## Update a product

Updates product data.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |

## Request Body

Content type: `application/json`

```

```

## Responses

**200** - Updates product data

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
```


## Security

- **api_key**
- **oauth2**: products:full