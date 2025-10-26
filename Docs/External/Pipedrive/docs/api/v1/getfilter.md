# GET /filters/{id}

> **Operation ID:** `getFilter`
> **Tags:** `Filters`

## Get one filter

Returns data about a specific filter. Note that this also returns the condition lines of the filter.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the filter |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, activities:read, activities:full, contacts:read, contacts:full