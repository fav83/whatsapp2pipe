# PATCH /deals/{id}/installments/{installment_id}

> **Operation ID:** `updateInstallment`
> **Tags:** `Deals`, `Beta`

## Update an installment added to a deal

Edits an installment added to a deal.

Only available in Growth and above plans.


## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `installment_id` | integer | path | Yes | The ID of the installment |

## Request Body

Content type: `application/json`

```
- **`description`** (*optional*) - string
  The name of the installment.
- **`amount`** (*optional*) - number
  The installment amount. Must be a positive number (excluding 0).
- **`billing_date`** (*optional*) - string
  The date which the installment will be charged. Must be in the format YYYY-MM-DD.
```

## Responses

**200** - Edited installment.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the installment
  - **`amount`** (*optional*) - number
    The installment amount.
  - **`billing_date`** (*optional*) - string
    The date which the installment will be charged.
  - **`description`** (*optional*) - string
    The name of installment.
  - **`deal_id`** (*optional*) - integer
    The ID of the deal the installment was added to.
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full