# DELETE /deals/{id}/products

> **Operation ID:** `deleteManyDealProducts`
> **Tags:** `Deals`

## Delete many products from a deal

Deletes multiple products from a deal. If no product IDs are specified, up to 100 products will be removed from the deal. A maximum of 100 product IDs can be provided per request.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `ids` | string | query | No | Comma-separated list of deal product IDs to delete. If not provided, all deal products will be deleted up to 100 items. Maximum 100 IDs allowed. |

## Responses

**200** - Delete many products from a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`ids`** (*optional*) - array of integer
    Array of IDs of products that were deleted from the deal
- **`additional_data`** (*optional*) - object
  - **`more_items_in_collection`** (*optional*) - boolean
    Whether there are more products to delete (when the deal has more than 100 products)
```


## Security

- **api_key**
- **oauth2**: products:full, deals:full