# GET /leads/search

> **Operation ID:** `searchLeads`
> **Tags:** `Leads`

## Search leads

Searches all leads by title, notes and/or custom fields. This endpoint is a wrapper of <a href="https://developers.pipedrive.com/docs/api/v1/ItemSearch#searchItem">/v1/itemSearch</a> with a narrower OAuth scope. Found leads can be filtered by the person ID and the organization ID.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `term` | string | query | Yes | The search term to look for. Minimum 2 characters (or 1 if using `exact_match`). Please note that the search term has to be URL encoded. |
| `fields` | string (`custom_fields`, `notes`, `title`) | query | No | A comma-separated string array. The fields to perform the search from. Defaults to all of them. |
| `exact_match` | boolean | query | No | When enabled, only full exact matches against the given term are returned. It is <b>not</b> case sensitive. |
| `person_id` | integer | query | No | Will filter leads by the provided person ID. The upper limit of found leads associated with the person is 2000. |
| `organization_id` | integer | query | No | Will filter leads by the provided organization ID. The upper limit of found leads associated with the organization is 2000. |
| `include_fields` | string (`lead.was_seen`) | query | No | Supports including optional fields in the results which are not provided by default |
| `start` | integer | query | No | Pagination start. Note that the pagination is based on main results and does not include related items when using `search_for_related_items` parameter. |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: leads:read, leads:full, search:read