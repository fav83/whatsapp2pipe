# GET /persons/collection

> **Operation ID:** `getPersonsCollection`
> **Tags:** `Persons`

## Get all persons collection

Returns all persons. Please note that only global admins (those with global permissions) can access this endpoint. Users with regular permissions will receive a 403 response. Read more about global permissions <a href="https://support.pipedrive.com/en/article/global-user-management" target="_blank" rel="noopener noreferrer">here</a>. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Persons#getPersons" target="_blank" rel="noopener noreferrer">GET /api/v2/persons</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `since` | string | query | No | The time boundary that points to the start of the range of data. Datetime in ISO 8601 format. E.g. 2022-11-01 08:55:59. Operates on the `update_time` field. |
| `until` | string | query | No | The time boundary that points to the end of the range of data. Datetime in ISO 8601 format. E.g. 2022-11-01 08:55:59. Operates on the `update_time` field. |
| `owner_id` | integer | query | No | If supplied, only persons owned by the given user will be returned |
| `first_char` | string | query | No | If supplied, only persons whose name starts with the specified letter will be returned (case-insensitive) |

## Responses

**200** - Success

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of object
- **`additional_data`** (*optional*) - object
  The additional data of the list
  - **`next_cursor`** (*optional*) - string
    The first item on the next page. The value of the `next_cursor` field will be `null` if you have reached the end of the dataset and there’s no more pages to be returned.
```

**403** - Forbidden response

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`error`** (*optional*) - string
  The error message
```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full