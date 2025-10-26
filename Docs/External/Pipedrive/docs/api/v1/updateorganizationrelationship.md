# PUT /organizationRelationships/{id}

> **Operation ID:** `updateOrganizationRelationship`
> **Tags:** `OrganizationRelationships`

## Update an organization relationship

Updates and returns an organization relationship.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization relationship |

## Request Body

Content type: `application/json`

```
- **`org_id`** (*optional*) - integer
  The ID of the base organization for the returned calculated values
- **`type`** (*optional*) - string
  The type of organization relationship
  Allowed values: `parent`, `related`
- **`rel_owner_org_id`** (*optional*) - integer
  The owner of this relationship. If type is `parent`, then the owner is the parent and the linked organization is the daughter.
- **`rel_linked_org_id`** (*optional*) - integer
  The linked organization in this relationship. If type is `parent`, then the linked organization is the daughter.
```

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full