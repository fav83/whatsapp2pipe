# PATCH /products/{id}/variations/{product_variation_id}

> **Operation ID:** `updateProductVariation`
> **Tags:** `Products`

## Update a product variation

Updates product variation data.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |
| `product_variation_id` | integer | path | Yes | The ID of the product variation |

## Request Body

Content type: `application/json`

```
- **`name`** (*optional*) - string
  The name of the product variation. The maximum length is 255 characters.
- **`prices`** (*optional*) - array of object
  Array of objects, each containing: currency (string), price (number), cost (number, optional), direct_cost (number, optional), notes (string, optional). When prices is omitted altogether, a default price of 0, a default cost of 0, a default direct_cost of 0 and the user's default currency will be assigned.
```

## Responses

**200** - Update product variation data

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - number
    The ID of the product variation
  - **`name`** (*optional*) - string
    The name of the product variation
  - **`product_id`** (*optional*) - integer
    The ID of the product
  - **`prices`** (*optional*) - array of object
    Array of objects, each containing: product_variation_id (number), currency (string), price (number), cost (number), direct_cost (number) , notes (string)
```


## Security

- **api_key**
- **oauth2**: products:full