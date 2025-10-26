# GET /stages/{id}/deals

> **Operation ID:** `getStageDeals`
> **Tags:** `Stages`

## Get deals in a stage

Lists deals in a specific stage. If no parameters are provided open deals owned by the authorized user will be returned. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Deals#getDeals" target="_blank" rel="noopener noreferrer">GET /api/v2/deals?stage_id={id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the stage |
| `filter_id` | integer | query | No | If supplied, only deals matching the given filter will be returned |
| `user_id` | integer | query | No | If supplied, `filter_id` will not be considered and only deals owned by the given user will be returned. If omitted, deals owned by the authorized user will be returned. |
| `everyone` | number (`0`, `1`) | query | No | If supplied, `filter_id` and `user_id` will not be considered – instead, deals owned by everyone will be returned |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Get deals in a stage

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
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
```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full