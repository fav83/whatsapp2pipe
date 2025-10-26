# GET /deals/installments

> **Operation ID:** `getInstallments`
> **Tags:** `Deals`, `Beta`

## List installments added to a list of deals

Lists installments attached to a list of deals.

Only available in Growth and above plans.


## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `deal_ids` | array | query | Yes | An array of integers with the IDs of the deals for which the attached installments will be returned. A maximum of 100 deal IDs can be provided. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `sort_by` | string (`id`, `billing_date`, `deal_id`) | query | No | The field to sort by. Supported fields: `id`, `billing_date`, `deal_id`. |
| `sort_direction` | string (`asc`, `desc`) | query | No | The sorting direction. Supported values: `asc`, `desc`. |

## Responses

**200** - List installments added to a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of object
  Array containing data for all installments added to a deal
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full