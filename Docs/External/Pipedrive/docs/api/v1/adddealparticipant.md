# POST /deals/{id}/participants

> **Operation ID:** `addDealParticipant`
> **Tags:** `Deals`

## Add a participant to a deal

Adds a participant to a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Request Body

Content type: `application/json`

```
- **`person_id`** (**required**) - integer
  The ID of the person
```

## Responses

**200** - Add new participant to the deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - any
  The object of participant
- **`related_objects`** (*optional*) - object
  - **`user`** (*optional*) - object
    - **`USER_ID`** (*optional*) - object

  - **`person`** (*optional*) - object
    - **`PERSON_ID`** (*optional*) - object
      The ID of the person associated with the item

```


## Security

- **api_key**
- **oauth2**: deals:full