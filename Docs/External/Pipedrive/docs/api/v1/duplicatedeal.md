# POST /deals/{id}/duplicate

> **Operation ID:** `duplicateDeal`
> **Tags:** `Deals`

## Duplicate deal

Duplicates a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Responses

**200** - Duplicate a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
```


## Security

- **api_key**
- **oauth2**: deals:full