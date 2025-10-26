# GET /personFields/{id}

> **Operation ID:** `getPersonField`
> **Tags:** `PersonFields`

## Get one person field

Returns data about a specific person field.

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
- **oauth2**: contacts:read, contacts:full, admin