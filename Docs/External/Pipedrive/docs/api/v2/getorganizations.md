# GET /organizations

> **Operation ID:** `getOrganizations`
> **Tags:** `Organizations`

## Get all organizations

Returns data about all organizations.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `filter_id` | integer | query | No | If supplied, only organizations matching the specified filter are returned |
| `ids` | string | query | No | Optional comma separated string array of up to 100 entity ids to fetch. If filter_id is provided, this is ignored. If any of the requested entities do not exist or are not visible, they are not included in the response. |
| `owner_id` | integer | query | No | If supplied, only organization owned by the specified user are returned. If filter_id is provided, this is ignored. |
| `updated_since` | string | query | No | If set, only organizations with an `update_time` later than or equal to this time are returned. In RFC3339 format, e.g. 2025-01-01T10:20:00Z. |
| `updated_until` | string | query | No | If set, only organizations with an `update_time` earlier than this time are returned. In RFC3339 format, e.g. 2025-01-01T10:20:00Z. |
| `sort_by` | string (`id`, `update_time`, `add_time`) | query | No | The field to sort by. Supported fields: `id`, `update_time`, `add_time`. |
| `sort_direction` | string (`asc`, `desc`) | query | No | The sorting direction. Supported values: `asc`, `desc`. |
| `include_fields` | string (`next_activity_id`, `last_activity_id`, `open_deals_count`, ...) | query | No | Optional comma separated string array of additional fields to include |
| `custom_fields` | string | query | No | Optional comma separated string array of custom fields keys to include. If you are only interested in a particular set of custom fields, please use this parameter for faster results and smaller response.<br/>A maximum of 15 keys is allowed. |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - Get all organizations

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full