# GET /deals/timeline

> **Operation ID:** `getDealsTimeline`
> **Tags:** `Deals`

## Get deals timeline

Returns not archived open and won deals, grouped by a defined interval of time set in a date-type dealField (`field_key`) — e.g. when month is the chosen interval, and 3 months are asked starting from January 1st, 2012, deals are returned grouped into 3 groups — January, February and March — based on the value of the given `field_key`.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `start_date` | string | query | Yes | The date when the first interval starts. Format: YYYY-MM-DD. |
| `interval` | string (`day`, `week`, `month`, ...) | query | Yes | The type of the interval<table><tr><th>Value</th><th>Description</th></tr><tr><td>`day`</td><td>Day</td></tr><tr><td>`week`</td><td>A full week (7 days) starting from `start_date`</td></tr><tr><td>`month`</td><td>A full month (depending on the number of days in given month) starting from `start_date`</td></tr><tr><td>`quarter`</td><td>A full quarter (3 months) starting from `start_date`</td></tr></table> |
| `amount` | integer | query | Yes | The number of given intervals, starting from `start_date`, to fetch. E.g. 3 (months). |
| `field_key` | string | query | Yes | The date field key which deals will be retrieved from |
| `user_id` | integer | query | No | If supplied, only deals matching the given user will be returned |
| `pipeline_id` | integer | query | No | If supplied, only deals matching the given pipeline will be returned |
| `filter_id` | integer | query | No | If supplied, only deals matching the given filter will be returned |
| `exclude_deals` | number (`0`, `1`) | query | No | Whether to exclude deals list (1) or not (0). Note that when deals are excluded, the timeline summary (counts and values) is still returned. |
| `totals_convert_currency` | string | query | No | The 3-letter currency code of any of the supported currencies. When supplied, `totals_converted` is returned per each interval which contains the currency-converted total amounts in the given currency. You may also set this parameter to `default_currency` in which case the user's default currency is used. |

## Responses

**200** - Get open and won deals, grouped by the defined interval of time

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  Open and won deals grouped into periods by defined interval, amount and date-type dealField (`field_key`)
  - **`period_start`** (*optional*) - string
    The start date and time of the period
  - **`period_end`** (*optional*) - string
    The end date and time of the period
  - **`deals`** (*optional*) - array of any
  - **`totals`** (*optional*) - object
    The total values of deals for the given period
    - **`count`** (*optional*) - integer
      The number of deals for the given period
    - **`values`** (*optional*) - object
      The total values of deals grouped by deal currency

    - **`weighted_values`** (*optional*) - object
      The total weighted values of deals for the given period grouped by deal currency. The weighted value of a deal is calculated as probability times deal value.

    - **`open_count`** (*optional*) - integer
      The number of open deals for the given period
    - **`open_values`** (*optional*) - object
      The total values of open deals for the given period grouped by deal currency

    - **`weighted_open_values`** (*optional*) - object
      The total weighted values of open deals for the given period grouped by deal currency. The weighted value of a deal is calculated as probability times deal value.

    - **`won_count`** (*optional*) - integer
      The number of won deals for the given period
    - **`won_values`** (*optional*) - object
      The total values of won deals for the given period grouped by deal currency

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full