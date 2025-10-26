# GET /persons/{id}/deals

> **Operation ID:** `getPersonDeals`
> **Tags:** `Persons`

## List deals associated with a person

Lists deals associated with a person. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Deals#getDeals" target="_blank" rel="noopener noreferrer">GET /api/v2/deals?person_id={id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `status` | string (`open`, `won`, `lost`, ...) | query | No | Only fetch deals with a specific status. If omitted, all not deleted deals are returned. If set to deleted, deals that have been deleted up to 30 days ago will be included. |
| `sort` | string | query | No | The field names and sorting mode separated by a comma (`field_name_1 ASC`, `field_name_2 DESC`). Only first-level field keys are supported (no nested keys). |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full