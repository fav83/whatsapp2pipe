# GET /deals/{id}/followers

> **Operation ID:** `getDealFollowers`
> **Tags:** `Deals`

## List followers of a deal

Lists the followers of a deal.

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