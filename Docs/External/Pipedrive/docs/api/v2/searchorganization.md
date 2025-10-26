# GET /organizations/search

> **Operation ID:** `searchOrganization`
> **Tags:** `Organizations`

## Search organizations

Searches all organizations by name, address, notes and/or custom fields. This endpoint is a wrapper of <a href="https://developers.pipedrive.com/docs/api/v1/ItemSearch#searchItem">/v1/itemSearch</a> with a narrower OAuth scope.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `term` | string | query | Yes | The search term to look for. Minimum 2 characters (or 1 if using `exact_match`). Please note that the search term has to be URL encoded. |
| `fields` | string (`address`, `custom_fields`, `notes`, ...) | query | No | A comma-separated string array. The fields to perform the search from. Defaults to all of them. Only the following custom field types are searchable: `address`, `varchar`, `text`, `varchar_auto`, `double`, `monetary` and `phone`. Read more about searching by custom fields <a href="https://support.pipedrive.com/en/article/search-finding-what-you-need#searching-by-custom-fields" target="_blank" rel="noopener noreferrer">here</a>. |
| `exact_match` | boolean | query | No | When enabled, only full exact matches against the given term are returned. It is <b>not</b> case sensitive. |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full, search:read