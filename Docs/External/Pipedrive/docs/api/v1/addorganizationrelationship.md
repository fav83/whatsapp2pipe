# POST /organizationRelationships

> **Operation ID:** `addOrganizationRelationship`
> **Tags:** `OrganizationRelationships`

## Create an organization relationship

Creates and returns an organization relationship.

## Request Body

Content type: `application/json`

```
- **`org_id`** (*optional*) - integer
  The ID of the base organization for the returned calculated values
- **`type`** (**required**) - string
  The type of organization relationship
  Allowed values: `parent`, `related`
- **`rel_owner_org_id`** (**required**) - integer
  The owner of the relationship. If type is `parent`, then the owner is the parent and the linked organization is the daughter.
- **`rel_linked_org_id`** (**required**) - integer
  The linked organization in the relationship. If type is `parent`, then the linked organization is the daughter.
```

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full