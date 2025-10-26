# GET /organizations/{id}/followers

> **Operation ID:** `getOrganizationFollowers`
> **Tags:** `Organizations`

## List followers of an organization

Lists the followers of an organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |

## Responses

**200** - Success

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - array of any
  The array of followers
- **`additional_data`** (*optional*) - object
  - **`pagination`** (*optional*) - object
    Pagination details of the list
    - **`start`** (*optional*) - integer
      Pagination start
    - **`limit`** (*optional*) - integer
      Items shown per page
    - **`more_items_in_collection`** (*optional*) - boolean
      Whether there are more list items in the collection than displayed
    - **`next_start`** (*optional*) - integer
      Next pagination start
```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full