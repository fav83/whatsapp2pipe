# GET /files/{id}/download

> **Operation ID:** `downloadFile`
> **Tags:** `Files`

## Download one file

Initializes a file download.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the file |

## Responses

**200** - success

Response type: `application/octet-stream`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, activities:read, activities:full, contacts:read, contacts:full