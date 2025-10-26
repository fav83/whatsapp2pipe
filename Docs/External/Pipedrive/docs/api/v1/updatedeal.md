# PUT /deals/{id}

> **Operation ID:** `updateDeal`
> **Tags:** `Deals`

## Update a deal

Updates the properties of a deal. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/updating-a-deal" target="_blank" rel="noopener noreferrer">updating a deal</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Request Body

Content type: `application/json`

```

```

## Responses

**200** - Add a deal

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