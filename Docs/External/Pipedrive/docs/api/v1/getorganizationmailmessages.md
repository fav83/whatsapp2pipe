# GET /organizations/{id}/mailMessages

> **Operation ID:** `getOrganizationMailMessages`
> **Tags:** `Organizations`

## List mail messages associated with an organization

Lists mail messages associated with an organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |
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