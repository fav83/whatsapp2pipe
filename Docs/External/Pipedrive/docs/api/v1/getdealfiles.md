# GET /deals/{id}/files

> **Operation ID:** `getDealFiles`
> **Tags:** `Deals`

## List files attached to a deal

Lists files associated with a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page. Please note that a maximum value of 100 is allowed. |
| `sort` | string | query | No | Supported fields: `id`, `update_time` |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full