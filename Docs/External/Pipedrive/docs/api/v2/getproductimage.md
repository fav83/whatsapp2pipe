# GET /products/{id}/images

> **Operation ID:** `getProductImage`
> **Tags:** `Products`, `Beta`

## Get image of a product

Retrieves the image of a product. The public URL has a limited lifetime of 7 days.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |

## Responses

**200** - Retrieves the image of a product. The public URL has a limited lifetime of 7 days.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  The product image data and the respective public URL
  - **`id`** (*optional*) - integer
    The ID of the product image
  - **`product_id`** (*optional*) - integer
    The ID of the product associated
  - **`company_id`** (*optional*) - string
    The ID of the company
  - **`public_url`** (*optional*) - string
    The public URL of the product image
  - **`add_time`** (*optional*) - string
    The date of image upload.
  - **`mime_type`** (*optional*) - string
    The MIME type of the product image
  - **`name`** (*optional*) - string
    The name of the product image file
```


## Security

- **api_key**
- **oauth2**: products:read, products:full