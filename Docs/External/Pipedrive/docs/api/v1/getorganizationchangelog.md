# GET /organizations/{id}/changelog

> **Operation ID:** `getOrganizationChangelog`
> **Tags:** `Organizations`

## List updates about organization field values

Lists updates about field values of an organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Get changelog of an organization

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: recents:read