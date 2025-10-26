# GET /activities

> **Operation ID:** `getActivities`
> **Tags:** `Activities`

## Get all activities

Returns data about all activities.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `filter_id` | integer | query | No | If supplied, only activities matching the specified filter are returned |
| `ids` | string | query | No | Optional comma separated string array of up to 100 entity ids to fetch. If filter_id is provided, this is ignored. If any of the requested entities do not exist or are not visible, they are not included in the response. |
| `owner_id` | integer | query | No | If supplied, only activities owned by the specified user are returned. If filter_id is provided, this is ignored. |
| `deal_id` | integer | query | No | If supplied, only activities linked to the specified deal are returned. If filter_id is provided, this is ignored. |
| `lead_id` | string | query | No | If supplied, only activities linked to the specified lead are returned. If filter_id is provided, this is ignored. |
| `person_id` | integer | query | No | If supplied, only activities whose primary participant is the given person are returned. If filter_id is provided, this is ignored. |
| `org_id` | integer | query | No | If supplied, only activities linked to the specified organization are returned. If filter_id is provided, this is ignored. |
| `done` | boolean | query | No | If supplied, only activities with specified 'done' flag value are returned |
| `updated_since` | string | query | No | If set, only activities with an `update_time` later than or equal to this time are returned. In RFC3339 format, e.g. 2025-01-01T10:20:00Z. |
| `updated_until` | string | query | No | If set, only activities with an `update_time` earlier than this time are returned. In RFC3339 format, e.g. 2025-01-01T10:20:00Z. |
| `sort_by` | string (`id`, `update_time`, `add_time`, ...) | query | No | The field to sort by. Supported fields: `id`, `update_time`, `add_time`, `due_date`. |
| `sort_direction` | string (`asc`, `desc`) | query | No | The sorting direction. Supported values: `asc`, `desc`. |
| `include_fields` | string (`attendees`) | query | No | Optional comma separated string array of additional fields to include |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - Get all activities

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: activities:read, activities:full