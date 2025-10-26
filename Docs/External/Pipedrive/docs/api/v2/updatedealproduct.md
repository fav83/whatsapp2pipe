# PATCH /deals/{id}/products/{product_attachment_id}

> **Operation ID:** `updateDealProduct`
> **Tags:** `Deals`

## Update the product attached to a deal

Updates the details of the product that has been attached to a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `product_attachment_id` | integer | path | Yes | The ID of the deal-product (the ID of the product attached to the deal) |

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
```


## Security

- **api_key**
- **oauth2**: products:full, deals:full