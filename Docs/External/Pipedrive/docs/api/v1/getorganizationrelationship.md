# GET /organizationRelationships/{id}

> **Operation ID:** `getOrganizationRelationship`
> **Tags:** `OrganizationRelationships`

## Get one organization relationship

Finds and returns an organization relationship from its ID.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization relationship |
| `org_id` | integer | query | No | The ID of the base organization for the returned calculated values |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full