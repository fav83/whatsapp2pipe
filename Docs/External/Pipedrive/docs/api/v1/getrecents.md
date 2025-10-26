# GET /recents

> **Operation ID:** `getRecents`
> **Tags:** `Recents`

## Get recents

Returns data about all recent changes occurred after the given timestamp.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `since_timestamp` | string | query | Yes | The timestamp in UTC. Format: YYYY-MM-DD HH:MM:SS. |
| `items` | string (`activity`, `activityType`, `deal`, ...) | query | No | Multiple selection of item types to include in the query (optional) |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - List of items changed since "since_timestamp"

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of any
- **`additional_data`** (*optional*) - object
  - **`since_timestamp`** (*optional*) - string
    The timestamp in UTC. Format: YYYY-MM-DD HH:MM:SS
  - **`last_timestamp_on_page`** (*optional*) - string
    The timestamp in UTC. Format: YYYY-MM-DD HH:MM:SS
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
- **oauth2**: recents:read, search:read