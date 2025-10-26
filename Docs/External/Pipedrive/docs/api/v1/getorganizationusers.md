# GET /organizations/{id}/permittedUsers

> **Operation ID:** `getOrganizationUsers`
> **Tags:** `Organizations`

## List permitted users

List users permitted to access an organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full