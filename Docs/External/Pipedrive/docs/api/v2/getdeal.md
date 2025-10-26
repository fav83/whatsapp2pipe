# GET /deals/{id}

> **Operation ID:** `getDeal`
> **Tags:** `Deals`

## Get details of a deal

Returns the details of a specific deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `include_fields` | string (`next_activity_id`, `last_activity_id`, `first_won_time`, ...) | query | No | Optional comma separated string array of additional fields to include |
| `custom_fields` | string | query | No | Optional comma separated string array of custom fields keys to include. If you are only interested in a particular set of custom fields, please use this parameter for faster results and smaller response.<br/>A maximum of 15 keys is allowed. |

## Responses

**200** - Get deal

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full