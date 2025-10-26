# GET /deals/search

> **Operation ID:** `searchDeals`
> **Tags:** `Deals`

## Search deals

Searches all deals by title, notes and/or custom fields. This endpoint is a wrapper of <a href="https://developers.pipedrive.com/docs/api/v1/ItemSearch#searchItem">/v1/itemSearch</a> with a narrower OAuth scope. Found deals can be filtered by the person ID and the organization ID.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `term` | string | query | Yes | The search term to look for. Minimum 2 characters (or 1 if using `exact_match`). Please note that the search term has to be URL encoded. |
| `fields` | string (`custom_fields`, `notes`, `title`) | query | No | A comma-separated string array. The fields to perform the search from. Defaults to all of them. Only the following custom field types are searchable: `address`, `varchar`, `text`, `varchar_auto`, `double`, `monetary` and `phone`. Read more about searching by custom fields <a href="https://support.pipedrive.com/en/article/search-finding-what-you-need#searching-by-custom-fields" target="_blank" rel="noopener noreferrer">here</a>. |
| `exact_match` | boolean | query | No | When enabled, only full exact matches against the given term are returned. It is <b>not</b> case sensitive. |
| `person_id` | integer | query | No | Will filter deals by the provided person ID. The upper limit of found deals associated with the person is 2000. |
| `organization_id` | integer | query | No | Will filter deals by the provided organization ID. The upper limit of found deals associated with the organization is 2000. |
| `status` | string (`open`, `won`, `lost`) | query | No | Will filter deals by the provided specific status. open = Open, won = Won, lost = Lost. The upper limit of found deals associated with the status is 2000. |
| `include_fields` | string (`deal.cc_email`) | query | No | Supports including optional fields in the results which are not provided by default |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, search:read