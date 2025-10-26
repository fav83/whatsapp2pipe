# GET /products

> **Operation ID:** `getProducts`
> **Tags:** `Products`

## Get all products

Returns data about all products.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `user_id` | integer | query | No | If supplied, only products owned by the given user will be returned |
| `filter_id` | integer | query | No | The ID of the filter to use |
| `ids` | array | query | No | An array of integers with the IDs of the products that should be returned in the response |
| `first_char` | string | query | No | If supplied, only products whose name starts with the specified letter will be returned (case-insensitive) |
| `get_summary` | boolean | query | No | If supplied, the response will return the total numbers of products in the `additional_data.summary.total_count` property |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - List of products

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of object
  Array containing data for all products
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
- **oauth2**: products:read, products:full