# DELETE /files/{id}

> **Operation ID:** `deleteFile`
> **Tags:** `Files`

## Delete a file

Marks a file as deleted. After 30 days, the file will be permanently deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the file |

## Responses

**200** - Delete a file from Pipedrive

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the file
```


## Security

- **api_key**
- **oauth2**: deals:full, activities:full, contacts:full