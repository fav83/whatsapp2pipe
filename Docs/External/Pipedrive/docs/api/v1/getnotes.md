# GET /notes

> **Operation ID:** `getNotes`
> **Tags:** `Notes`

## Get all notes

Returns all notes.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `user_id` | integer | query | No | The ID of the user whose notes to fetch. If omitted, notes by all users will be returned. |
| `lead_id` | string | query | No | The ID of the lead which notes to fetch. If omitted, notes about all leads will be returned. |
| `deal_id` | integer | query | No | The ID of the deal which notes to fetch. If omitted, notes about all deals will be returned. |
| `person_id` | integer | query | No | The ID of the person whose notes to fetch. If omitted, notes about all persons will be returned. |
| `org_id` | integer | query | No | The ID of the organization which notes to fetch. If omitted, notes about all organizations will be returned. |
| `project_id` | integer | query | No | The ID of the project which notes to fetch. If omitted, notes about all projects will be returned. |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `sort` | string | query | No | The field names and sorting mode separated by a comma (`field_name_1 ASC`, `field_name_2 DESC`). Only first-level field keys are supported (no nested keys). Supported fields: `id`, `user_id`, `deal_id`, `person_id`, `org_id`, `content`, `add_time`, `update_time`. |
| `start_date` | string | query | No | The date in format of YYYY-MM-DD from which notes to fetch |
| `end_date` | string | query | No | The date in format of YYYY-MM-DD until which notes to fetch to |
| `pinned_to_lead_flag` | number (`0`, `1`) | query | No | If set, the results are filtered by note to lead pinning state |
| `pinned_to_deal_flag` | number (`0`, `1`) | query | No | If set, the results are filtered by note to deal pinning state |
| `pinned_to_organization_flag` | number (`0`, `1`) | query | No | If set, the results are filtered by note to organization pinning state |
| `pinned_to_person_flag` | number (`0`, `1`) | query | No | If set, the results are filtered by note to person pinning state |
| `pinned_to_project_flag` | number (`0`, `1`) | query | No | If set, the results are filtered by note to project pinning state |

## Responses

**200** - Get all notes

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - array of object
  The array of notes
- **`additional_data`** (*optional*) - object
  - **`pagination`** (*optional*) - object
    The pagination details of the list
    - **`next_start`** (*optional*) - integer
      Next pagination start
    - **`start`** (*optional*) - integer
      Pagination start
    - **`limit`** (*optional*) - integer
      Items shown per page
    - **`more_items_in_collection`** (*optional*) - boolean
      If there are more list items in the collection than displayed or not
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, contacts:read, contacts:full