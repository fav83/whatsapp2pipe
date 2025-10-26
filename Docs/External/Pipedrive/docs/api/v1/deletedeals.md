# DELETE /deals

> **Operation ID:** `deleteDeals`
> **Tags:** `Deals`

## Delete multiple deals in bulk

Marks multiple deals as deleted. After 30 days, the deals will be permanently deleted. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Deals#deleteDeal" target="_blank" rel="noopener noreferrer">DELETE /api/v2/deals/{id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `ids` | string | query | Yes | The comma-separated IDs that will be deleted |

## Responses

**200** - Delete multiple deals in bulk

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - array of integer
    The list of deleted deals IDs
```


## Security

- **api_key**
- **oauth2**: deals:full