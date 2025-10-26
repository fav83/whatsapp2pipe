# GET /deals/summary

> **Operation ID:** `getDealsSummary`
> **Tags:** `Deals`

## Get deals summary

Returns a summary of all not archived deals.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `status` | string (`open`, `won`, `lost`) | query | No | Only fetch deals with a specific status. open = Open, won = Won, lost = Lost. |
| `filter_id` | integer | query | No | <code>user_id</code> will not be considered. Only deals matching the given filter will be returned. |
| `user_id` | integer | query | No | Only deals matching the given user will be returned. `user_id` will not be considered if you use `filter_id`. |
| `pipeline_id` | integer | query | No | Only deals within the given pipeline will be returned |
| `stage_id` | integer | query | No | Only deals within the given stage will be returned |

## Responses

**200** - Get the summary of not archived deals

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  The summary of deals
  - **`values_total`** (*optional*) - object
    The total values of the deals grouped by deal currency
    - **`value`** (*optional*) - number
      The total value of deals in the deal currency group
    - **`count`** (*optional*) - integer
      The number of deals in the deal currency group
    - **`value_converted`** (*optional*) - number
      The total value of deals converted into the company default currency
    - **`value_formatted`** (*optional*) - string
      The total value of deals formatted with deal currency. E.g. €50
    - **`value_converted_formatted`** (*optional*) - string
      The value_converted formatted with deal currency. E.g. US$50.10
  - **`weighted_values_total`** (*optional*) - object
    The total weighted values of the deals grouped by deal currency. The weighted value is calculated as probability times deal value.
    - **`value`** (*optional*) - number
      The total weighted value of the deals in the deal currency group
    - **`count`** (*optional*) - integer
      The number of deals in the deal currency group
    - **`value_formatted`** (*optional*) - string
      The total weighted value of the deals formatted with deal currency. E.g. €50
  - **`total_count`** (*optional*) - integer
    The total number of deals
  - **`total_currency_converted_value`** (*optional*) - number
    The total value of deals converted into the company default currency
  - **`total_weighted_currency_converted_value`** (*optional*) - number
    The total weighted value of deals converted into the company default currency
  - **`total_currency_converted_value_formatted`** (*optional*) - string
    The total converted value of deals formatted with the company default currency. E.g. US$5,100.96
  - **`total_weighted_currency_converted_value_formatted`** (*optional*) - string
    The total weighted value of deals formatted with the company default currency. E.g. US$5,100.96
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full