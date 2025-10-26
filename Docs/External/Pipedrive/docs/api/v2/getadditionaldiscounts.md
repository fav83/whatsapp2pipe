# GET /deals/{id}/discounts

> **Operation ID:** `getAdditionalDiscounts`
> **Tags:** `Deals`

## List discounts added to a deal

Lists discounts attached to a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Responses

**200** - List of discounts added to deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of object
  Array containing data for all discounts added to a deal
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full