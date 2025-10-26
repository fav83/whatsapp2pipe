# GET /legacyTeams

> **Operation ID:** `getTeams`
> **Tags:** `LegacyTeams`

## Get all teams

Returns data about teams within the company.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `order_by` | string (`id`, `name`, `manager_id`, ...) | query | No | The field name to sort returned teams by |
| `skip_users` | number (`0`, `1`) | query | No | When enabled, the teams will not include IDs of member users |

## Responses

**200** - The list of team objects

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: users:read