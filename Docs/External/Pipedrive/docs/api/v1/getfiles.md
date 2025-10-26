# GET /files

> **Operation ID:** `getFiles`
> **Tags:** `Files`

## Get all files

Returns data about all files.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page. Please note that a maximum value of 100 is allowed. |
| `sort` | string | query | No | Supported fields: `id`, `update_time` |

## Responses

**200** - Get data about all files uploaded to Pipedrive

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - array of object
  The array of all uploaded files
- **`additional_data`** (*optional*) - object
  - **`pagination`** (*optional*) - object
    Pagination details of the list

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, activities:read, activities:full, contacts:read, contacts:full