# GET /deals/archived

> **Operation ID:** `getArchivedDeals`
> **Tags:** `Deals`

## Get all archived deals

Returns all archived deals.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `user_id` | integer | query | No | If supplied, only deals matching the given user will be returned. However, `filter_id` and `owned_by_you` takes precedence over `user_id` when supplied. |
| `filter_id` | integer | query | No | The ID of the filter to use |
| `person_id` | integer | query | No | If supplied, only deals linked to the specified person are returned. If filter_id is provided, this is ignored. |
| `org_id` | integer | query | No | If supplied, only deals linked to the specified organization are returned. If filter_id is provided, this is ignored. |
| `product_id` | integer | query | No | If supplied, only deals linked to the specified product are returned. If filter_id is provided, this is ignored. |
| `pipeline_id` | integer | query | No | If supplied, only deals in the specified pipeline are returned. If filter_id is provided, this is ignored. |
| `stage_id` | integer | query | No | If supplied, only deals in the specified stage are returned. If filter_id is provided, this is ignored. |
| `status` | string (`open`, `won`, `lost`, ...) | query | No | Only fetch deals with a specific status. If omitted, all not deleted deals are returned. If set to deleted, deals that have been deleted up to 30 days ago will be included. |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `sort` | string | query | No | The field names and sorting mode separated by a comma (`field_name_1 ASC`, `field_name_2 DESC`). Only first-level field keys are supported (no nested keys). |
| `owned_by_you` | number (`0`, `1`) | query | No | When supplied, only deals owned by you are returned. However, `filter_id` takes precedence over `owned_by_you` when both are supplied. |

## Responses

**200** - Get all archived deals

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of any
  The array of deals
- **`additional_data`** (*optional*) - object
  The additional data of the list
  - **`start`** (*optional*) - integer
    Pagination start
  - **`limit`** (*optional*) - integer
    Items shown per page
  - **`more_items_in_collection`** (*optional*) - boolean
    If there are more list items in the collection than displayed or not
- **`related_objects`** (*optional*) - object
  - **`user`** (*optional*) - object
    - **`USER_ID`** (*optional*) - object

  - **`organization`** (*optional*) - object
    - **`ORGANIZATION_ID`** (*optional*) - object
      The ID of the organization associated with the item

  - **`person`** (*optional*) - object
    - **`PERSON_ID`** (*optional*) - object
      The ID of the person associated with the item

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full