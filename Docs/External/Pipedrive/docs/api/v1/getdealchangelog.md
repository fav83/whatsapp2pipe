# GET /deals/{id}/changelog

> **Operation ID:** `getDealChangelog`
> **Tags:** `Deals`

## List updates about deal field values

Lists updates about field values of a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Get changelog of a deal

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: recents:read