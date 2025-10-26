# DELETE /deals/{id}/installments/{installment_id}

> **Operation ID:** `deleteInstallment`
> **Tags:** `Deals`, `Beta`

## Delete an installment from a deal

Removes an installment from a deal.

Only available in Growth and above plans.


## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `installment_id` | integer | path | Yes | The ID of the installment |

## Responses

**200** - The ID of the deleted installment.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the installment that was deleted from the deal
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full