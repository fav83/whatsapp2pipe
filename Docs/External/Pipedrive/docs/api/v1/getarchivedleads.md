# GET /leads/archived

> **Operation ID:** `getArchivedLeads`
> **Tags:** `Leads`

## Get all archived leads

Returns multiple archived leads. Leads are sorted by the time they were created, from oldest to newest. Pagination can be controlled using `limit` and `start` query parameters. If a lead contains custom fields, the fields' values will be included in the response in the same format as with the `Deals` endpoints. If a custom field's value hasn't been set for the lead, it won't appear in the response. Please note that leads do not have a separate set of custom fields, instead they inherit the custom fields' structure from deals.


## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. |
| `start` | integer | query | No | For pagination, the position that represents the first result for the page |
| `owner_id` | integer | query | No | If supplied, only leads matching the given user will be returned. However, `filter_id` takes precedence over `owner_id` when supplied. |
| `person_id` | integer | query | No | If supplied, only leads matching the given person will be returned. However, `filter_id` takes precedence over `person_id` when supplied. |
| `organization_id` | integer | query | No | If supplied, only leads matching the given organization will be returned. However, `filter_id` takes precedence over `organization_id` when supplied. |
| `filter_id` | integer | query | No | The ID of the filter to use |
| `sort` | string (`id`, `title`, `owner_id`, ...) | query | No | The field names and sorting mode separated by a comma (`field_name_1 ASC`, `field_name_2 DESC`). Only first-level field keys are supported (no nested keys). |

## Responses

**200** - Successful response containing payload in the `data` field

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of object
- **`additional_data`** (*optional*) - object
  The additional data of the list
  - **`start`** (*optional*) - integer
    Pagination start
  - **`limit`** (*optional*) - integer
    Items shown per page
  - **`more_items_in_collection`** (*optional*) - boolean
    If there are more list items in the collection than displayed or not
```


## Security

- **api_key**
- **oauth2**: leads:read, leads:full