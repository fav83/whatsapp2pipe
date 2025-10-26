# PUT /products/{id}/images

> **Operation ID:** `updateProductImage`
> **Tags:** `Products`, `Beta`

## Update an image for a product

Updates the image of a product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |

## Request Body

Content type: `multipart/form-data`

```
- **`data`** (**required**) - string
  One image supplied in the multipart/form-data encoding
```

## Responses

**200** - Edited product image.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the product image
  - **`product_id`** (*optional*) - number
    The ID of the product associated
  - **`company_id`** (*optional*) - string
    The ID of the company
  - **`add_time`** (*optional*) - string
    The date of image upload.
```


## Security

- **api_key**
- **oauth2**: products:full