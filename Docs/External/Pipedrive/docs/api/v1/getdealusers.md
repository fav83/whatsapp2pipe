# GET /deals/{id}/permittedUsers

> **Operation ID:** `getDealUsers`
> **Tags:** `Deals`

## List permitted users

Lists the users permitted to access a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full