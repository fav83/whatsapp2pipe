# GET /organizationFields

> **Operation ID:** `getOrganizationFields`
> **Tags:** `OrganizationFields`

## Get all organization fields

Returns data about all organization fields.

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
- **oauth2**: contacts:read, contacts:full, admin