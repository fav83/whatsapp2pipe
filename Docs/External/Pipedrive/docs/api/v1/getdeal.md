# GET /deals/{id}

> **Operation ID:** `getDeal`
> **Tags:** `Deals`

## Get details of a deal

Returns the details of a specific deal. Note that this also returns some additional fields which are not present when asking for all deals – such as deal age and stay in pipeline stages. Also note that custom fields appear as long hashes in the resulting data. These hashes can be mapped against the `key` value of dealFields. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/getting-details-of-a-deal" target="_blank" rel="noopener noreferrer">getting details of a deal</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Responses

**200** - Get a deal by its ID

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
- **`additional_data`** (*optional*) - object
  - **`dropbox_email`** (*optional*) - string
    The BCC email of the deal
- **`related_objects`** (*optional*) - object
  - **`user`** (*optional*) - object
    - **`USER_ID`** (*optional*) - object

  - **`person`** (*optional*) - object
    - **`PERSON_ID`** (*optional*) - object
      The ID of the person associated with the item

  - **`organization`** (*optional*) - object
    - **`ORGANIZATION_ID`** (*optional*) - object
      The ID of the organization associated with the item

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full