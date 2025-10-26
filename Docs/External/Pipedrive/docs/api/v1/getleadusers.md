# GET /leads/{id}/permittedUsers

> **Operation ID:** `getLeadUsers`
> **Tags:** `Leads`

## List permitted users

Lists the users permitted to access a lead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the lead |

## Responses

**200** - Lists users permitted to access a lead

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: leads:read, leads:full