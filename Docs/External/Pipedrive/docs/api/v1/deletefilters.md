# DELETE /filters

> **Operation ID:** `deleteFilters`
> **Tags:** `Filters`

## Delete multiple filters in bulk

Marks multiple filters as deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `ids` | string | query | Yes | The comma-separated filter IDs to delete |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:full, activities:full, contacts:full