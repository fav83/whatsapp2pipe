# GET /deals/{id}/mailMessages

> **Operation ID:** `getDealMailMessages`
> **Tags:** `Deals`

## List mail messages associated with a deal

Lists mail messages associated with a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: mail:read, mail:full