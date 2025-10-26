# GET /organizations/{id}/files

> **Operation ID:** `getOrganizationFiles`
> **Tags:** `Organizations`

## List files attached to an organization

Lists files associated with an organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |
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
- **oauth2**: contacts:read, contacts:full