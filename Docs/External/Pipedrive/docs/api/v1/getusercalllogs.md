# GET /callLogs

> **Operation ID:** `getUserCallLogs`
> **Tags:** `CallLogs`

## Get all call logs assigned to a particular user

Returns all call logs assigned to a particular user.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. The upper limit is 50. |

## Responses

**200** - A list of call logs.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of any
- **`additional_data`** (*optional*) - object
  - **`pagination`** (*optional*) - object
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
- **oauth2**: phone-integration