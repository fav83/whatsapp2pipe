# PATCH /deals/{id}/discounts/{discount_id}

> **Operation ID:** `updateAdditionalDiscount`
> **Tags:** `Deals`

## Update a discount added to a deal

Edits a discount added to a deal, changing the deal value if the deal has one-time products attached.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `discount_id` | string | path | Yes | The ID of the discount |

## Request Body

Content type: `application/json`

```
- **`description`** (*optional*) - string
  The name of the discount.
- **`amount`** (*optional*) - number
  The discount amount. Must be a positive number (excluding 0).
- **`type`** (*optional*) - string
  Determines whether the discount is applied as a percentage or a fixed amount.
  Allowed values: `percentage`, `amount`
```

## Responses

**200** - Edited discount.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - string
    The ID of the additional discount
  - **`type`** (*optional*) - string
    Determines whether the discount is applied as a percentage or a fixed amount.
    Allowed values: `percentage`, `amount`
  - **`amount`** (*optional*) - number
    The discount amount.
  - **`description`** (*optional*) - string
    The name of the discount.
  - **`deal_id`** (*optional*) - integer
    The ID of the deal the discount was added to.
  - **`created_at`** (*optional*) - string
    The date and time of when the discount was created in the ISO 8601 format.
  - **`created_by`** (*optional*) - integer
    The ID of the user that created the discount.
  - **`updated_at`** (*optional*) - string
    The date and time of when the discount was created in the ISO 8601 format.
  - **`updated_by`** (*optional*) - integer
    The ID of the user that last updated the discount.
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full