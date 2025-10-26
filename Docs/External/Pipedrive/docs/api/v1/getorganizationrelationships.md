# GET /organizationRelationships

> **Operation ID:** `getOrganizationRelationships`
> **Tags:** `OrganizationRelationships`

## Get all relationships for organization

Gets all of the relationships for a supplied organization ID.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `org_id` | integer | query | Yes | The ID of the organization to get relationships for |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full