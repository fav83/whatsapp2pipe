# POST /products/{id}/images

> **Operation ID:** `uploadProductImage`
> **Tags:** `Products`, `Beta`

## Upload an image for a product

Uploads an image for a product.

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

**201** - Image added to product.

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