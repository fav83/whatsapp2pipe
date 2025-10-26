# GET /deals/{id}/participantsChangelog

> **Operation ID:** `getDealParticipantsChangelog`
> **Tags:** `Deals`

## List updates about participants of a deal

List updates about participants of a deal. This is a cursor-paginated endpoint. For more information, please refer to our documentation on <a href="https://pipedrive.readme.io/docs/core-api-concepts-pagination" target="_blank" rel="noopener noreferrer">pagination</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `limit` | integer | query | No | Items shown per page |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - Get participant changelogs for a given deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - array of object
  The array of participant changelog
- **`additional_data`** (*optional*) - object
  The additional data of the list
  - **`start`** (*optional*) - integer
    Pagination start
  - **`limit`** (*optional*) - integer
    Items shown per page
  - **`more_items_in_collection`** (*optional*) - boolean
    If there are more list items in the collection than displayed or not
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full