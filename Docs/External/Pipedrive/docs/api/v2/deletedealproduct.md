# DELETE /deals/{id}/products/{product_attachment_id}

> **Operation ID:** `deleteDealProduct`
> **Tags:** `Deals`

## Delete an attached product from a deal

Deletes a product attachment from a deal, using the `product_attachment_id`.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `product_attachment_id` | integer | path | Yes | The product attachment ID |

## Responses

**200** - Delete an attached product from a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of an attached product that was deleted from the deal
```


## Security

- **api_key**
- **oauth2**: deals:full, products:full