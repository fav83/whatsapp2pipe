# GET /currencies

> **Operation ID:** `getCurrencies`
> **Tags:** `Currencies`

## Get all supported currencies

Returns all supported currencies in given account which should be used when saving monetary values with other objects. The `code` parameter of the returning objects is the currency code according to ISO 4217 for all non-custom currencies.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `term` | string | query | No | Optional search term that is searched for from currency's name and/or code |

## Responses

**200** - The list of supported currencies

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of object
  The array of currencies
```


## Security

- **api_key**
- **oauth2**: base