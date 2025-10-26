# DELETE /organizations/{id}

> **Operation ID:** `deleteOrganization`
> **Tags:** `Organizations`

## Delete a organization

Marks a organization as deleted. After 30 days, the organization will be permanently deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |

## Responses

**200** - Delete organization

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    Deleted organization ID
```


## Security

- **api_key**
- **oauth2**: contacts:full