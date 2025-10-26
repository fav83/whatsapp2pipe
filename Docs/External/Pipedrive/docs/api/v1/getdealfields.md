# GET /dealFields

> **Operation ID:** `getDealFields`
> **Tags:** `DealFields`

## Get all deal fields

Returns data about all deal fields.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, admin