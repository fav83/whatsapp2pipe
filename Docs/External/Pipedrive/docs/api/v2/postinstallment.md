# POST /deals/{id}/installments

> **Operation ID:** `postInstallment`
> **Tags:** `Deals`, `Beta`

## Add an installment to a deal

Adds an installment to a deal.

An installment can only be added if the deal includes at least one one-time product. 
If the deal contains at least one recurring product, adding installments is not allowed.

Only available in Growth and above plans.


## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Request Body

Content type: `application/json`

```
- **`description`** (**required**) - string
  The name of the installment.
- **`amount`** (**required**) - number
  The installment amount. Must be a positive number (excluding 0).
- **`billing_date`** (**required**) - string
  The date which the installment will be charged. Must be in the format YYYY-MM-DD.
```

## Responses

**200** - Installment added to deal

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