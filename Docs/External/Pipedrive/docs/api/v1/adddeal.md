# POST /deals

> **Operation ID:** `addDeal`
> **Tags:** `Deals`

## Add a deal

Adds a new deal. All deals created through the Pipedrive API will have a `origin` set to `API`. Note that you can supply additional custom fields along with the request that are not described here. These custom fields are different for each Pipedrive account and can be recognized by long hashes as keys. To determine which custom fields exists, fetch the dealFields and look for `key` values. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/creating-a-deal" target="_blank" rel="noopener noreferrer">adding a deal</a>.

## Request Body

Content type: `application/json`

```

```

## Responses

**201** - Add a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
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
- **oauth2**: deals:full