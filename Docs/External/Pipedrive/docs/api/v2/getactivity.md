# GET /activities/{id}

> **Operation ID:** `getActivity`
> **Tags:** `Activities`

## Get details of an activity

Returns the details of a specific activity.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the activity |
| `include_fields` | string (`attendees`) | query | No | Optional comma separated string array of additional fields to include |

## Responses

**200** - Get activity

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: activities:read, activities:full