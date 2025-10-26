# GET /legacyTeams/user/{id}

> **Operation ID:** `getUserTeams`
> **Tags:** `LegacyTeams`

## Get all teams of a user

Returns data about all teams which have the specified user as a member.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the user |
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