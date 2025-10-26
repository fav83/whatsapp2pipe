# GET /organizations/{id}/followers

> **Operation ID:** `getOrganizationFollowers`
> **Tags:** `Organizations`

## List followers of an organization

Lists users who are following the organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - List entity followers

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full