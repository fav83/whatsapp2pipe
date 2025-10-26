# GET /activities

> **Operation ID:** `getActivities`
> **Tags:** `Activities`

## Get all activities assigned to a particular user

Returns all activities assigned to a particular user.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `user_id` | integer | query | No | The ID of the user whose activities will be fetched. If omitted, the user associated with the API token will be used. If 0, activities for all company users will be fetched based on the permission sets. |
| `filter_id` | integer | query | No | The ID of the filter to use (will narrow down results if used together with `user_id` parameter) |
| `type` | string | query | No | The type of the activity, can be one type or multiple types separated by a comma. This is in correlation with the `key_string` parameter of ActivityTypes. |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. |
| `start` | integer | query | No | For pagination, the position that represents the first result for the page |
| `start_date` | string | query | No | Use the activity due date where you wish to begin fetching activities from. Insert due date in YYYY-MM-DD format. |
| `end_date` | string | query | No | Use the activity due date where you wish to stop fetching activities from. Insert due date in YYYY-MM-DD format. |
| `done` | number (`0`, `1`) | query | No | Whether the activity is done or not. 0 = Not done, 1 = Done. If omitted returns both done and not done activities. |

## Responses

**200** - A list of activities

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of any
- **`additional_data`** (*optional*) - object
  - **`pagination`** (*optional*) - object
    Pagination details of the list
    - **`start`** (*optional*) - integer
      Pagination start
    - **`limit`** (*optional*) - integer
      Items shown per page
    - **`more_items_in_collection`** (*optional*) - boolean
      Whether there are more list items in the collection than displayed
    - **`next_start`** (*optional*) - integer
      Next pagination start
- **`related_objects`** (*optional*) - object
  - **`user`** (*optional*) - object
    - **`USER_ID`** (*optional*) - object

  - **`deal`** (*optional*) - object
    - **`DEAL_ID`** (*optional*) - object
      The ID of the deal which is associated with the item
      - **`id`** (*optional*) - integer
        The ID of the deal associated with the item
      - **`title`** (*optional*) - string
        The title of the deal associated with the item
      - **`status`** (*optional*) - string
        The status of the deal associated with the item
      - **`value`** (*optional*) - number
        The value of the deal that is associated with the item
      - **`currency`** (*optional*) - string
        The currency of the deal value
      - **`stage_id`** (*optional*) - integer
        The ID of the stage the deal is currently at
      - **`pipeline_id`** (*optional*) - integer
        The ID of the pipeline the deal is in
  - **`person`** (*optional*) - object
    - **`PERSON_ID`** (*optional*) - object
      The ID of the person associated with the item

  - **`organization`** (*optional*) - object
    - **`ORGANIZATION_ID`** (*optional*) - object
      The ID of the organization associated with the item

```


## Security

- **api_key**
- **oauth2**: activities:read, activities:full