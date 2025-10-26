# POST /products

> **Operation ID:** `addProduct`
> **Tags:** `Products`

## Add a product

Adds a new product to the Products inventory. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/adding-a-product" target="_blank" rel="noopener noreferrer">adding a product</a>.

## Request Body

Content type: `application/json`

```

```

## Responses

**201** - Add product data

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
```


## Security

- **api_key**
- **oauth2**: products:full