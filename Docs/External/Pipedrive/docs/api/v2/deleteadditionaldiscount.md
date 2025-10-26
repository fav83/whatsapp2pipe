# DELETE /deals/{id}/discounts/{discount_id}

> **Operation ID:** `deleteAdditionalDiscount`
> **Tags:** `Deals`

## Delete a discount from a deal

Removes a discount from a deal, changing the deal value if the deal has one-time products attached.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `discount_id` | string | path | Yes | The ID of the discount |

## Responses

**200** - The ID of the deleted discount.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the discount that was deleted from the deal
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full