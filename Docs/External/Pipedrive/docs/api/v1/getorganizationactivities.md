# GET /organizations/{id}/activities

> **Operation ID:** `getOrganizationActivities`
> **Tags:** `Organizations`

## List activities associated with an organization

Lists activities associated with an organization. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Activities#getActivities" target="_blank" rel="noopener noreferrer">GET /api/v2/activities?org_id={id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `done` | number (`0`, `1`) | query | No | Whether the activity is done or not. 0 = Not done, 1 = Done. If omitted returns both Done and Not done activities. |
| `exclude` | string | query | No | A comma-separated string of activity IDs to exclude from result |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: activities:read, activities:full