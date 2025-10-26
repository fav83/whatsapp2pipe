# GET /organizations/{id}

> **Operation ID:** `getOrganization`
> **Tags:** `Organizations`

## Get details of an organization

Returns the details of an organization. Note that this also returns some additional fields which are not present when asking for all organizations. Also note that custom fields appear as long hashes in the resulting data. These hashes can be mapped against the `key` value of organizationFields.

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