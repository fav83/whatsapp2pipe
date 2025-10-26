# GET /filters

> **Operation ID:** `getFilters`
> **Tags:** `Filters`

## Get all filters

Returns data about all filters.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `type` | string (`deals`, `leads`, `org`, ...) | query | No | The types of filters to fetch |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, activities:read, activities:full, contacts:read, contacts:full