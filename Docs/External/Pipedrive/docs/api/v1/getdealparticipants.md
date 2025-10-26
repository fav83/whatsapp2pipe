# GET /deals/{id}/participants

> **Operation ID:** `getDealParticipants`
> **Tags:** `Deals`

## List participants of a deal

Lists the participants associated with a deal.<br>If a company uses the [Campaigns product](https://pipedrive.readme.io/docs/campaigns-in-pipedrive-api), then this endpoint will also return the `data.marketing_status` field.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Get all deal participants by the DealID

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - array of object
  The array of participants
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