# GET /dealFields/{id}

> **Operation ID:** `getDealField`
> **Tags:** `DealFields`

## Get one deal field

Returns data about a specific deal field.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the field |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, admin