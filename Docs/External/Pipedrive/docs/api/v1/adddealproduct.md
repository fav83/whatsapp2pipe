# POST /deals/{id}/products

> **Operation ID:** `addDealProduct`
> **Tags:** `Deals`

## Add a product to a deal

Adds a product to a deal, creating a new item called a deal-product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Request Body

Content type: `application/json`

```

```

## Responses

**200** - Add a product to the deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
  The added product object attached to the deal
```


## Security

- **api_key**
- **oauth2**: deals:full, products:full