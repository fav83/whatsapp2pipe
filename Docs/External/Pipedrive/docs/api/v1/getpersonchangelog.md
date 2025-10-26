# GET /persons/{id}/changelog

> **Operation ID:** `getPersonChangelog`
> **Tags:** `Persons`

## List updates about person field values

Lists updates about field values of a person.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Get changelog of a person

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: recents:read