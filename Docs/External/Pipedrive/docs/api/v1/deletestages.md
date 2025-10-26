# DELETE /stages

> **Operation ID:** `deleteStages`
> **Tags:** `Stages`

## Delete multiple stages in bulk

Marks multiple stages as deleted. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Stages#deleteStage" target="_blank" rel="noopener noreferrer">DELETE /api/v2/stages/{id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `ids` | string | query | Yes | The comma-separated stage IDs to delete |

## Responses

**200** - Delete multiple stages

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - array of integer
    The list of deleted stage IDs
```


## Security

- **api_key**
- **oauth2**: admin