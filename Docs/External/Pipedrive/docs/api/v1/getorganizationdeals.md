# GET /organizations/{id}/deals

> **Operation ID:** `getOrganizationDeals`
> **Tags:** `Organizations`

## List deals associated with an organization

Lists deals associated with an organization. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Deals#getDeals" target="_blank" rel="noopener noreferrer">GET /api/v2/deals?org_id={id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `status` | string (`open`, `won`, `lost`, ...) | query | No | Only fetch deals with a specific status. If omitted, all not deleted deals are returned. If set to deleted, deals that have been deleted up to 30 days ago will be included. |
| `sort` | string | query | No | The field names and sorting mode separated by a comma (`field_name_1 ASC`, `field_name_2 DESC`). Only first-level field keys are supported (no nested keys). |
| `only_primary_association` | number (`0`, `1`) | query | No | If set, only deals that are directly associated to the organization are fetched. If not set (default), all deals are fetched that are either directly or indirectly related to the organization. Indirect relations include relations through custom, organization-type fields and through persons of the given organization. |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full