# DELETE /organizations/{id}

> **Operation ID:** `deleteOrganization`
> **Tags:** `Organizations`

## Delete an organization

Marks an organization as deleted. After 30 days, the organization will be permanently deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |

## Responses

**200** - Success

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the organization that was deleted
```


## Security

- **api_key**
- **oauth2**: contacts:full