# POST /products

> **Operation ID:** `addProduct`
> **Tags:** `Products`

## Add a product

Adds a new product to the Products inventory. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/adding-a-product" target="_blank" rel="noopener noreferrer">adding a product</a>.

## Request Body

Content type: `application/json`

```

```

## Responses

**201** - Add product data

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
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
- **oauth2**: products:full