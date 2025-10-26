# DELETE /organizations

> **Operation ID:** `deleteOrganizations`
> **Tags:** `Organizations`

## Delete multiple organizations in bulk

Marks multiple organizations as deleted. After 30 days, the organizations will be permanently deleted. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Organizations#deleteOrganization" target="_blank" rel="noopener noreferrer">DELETE /api/v2/organizations/{id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `ids` | string | query | Yes | The comma-separated IDs that will be deleted |

## Responses

**200** - Success

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - array of number
    The IDs of the organizations that were deleted
```


## Security

- **api_key**
- **oauth2**: contacts:full