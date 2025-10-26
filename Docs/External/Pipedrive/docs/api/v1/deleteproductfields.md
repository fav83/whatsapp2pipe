# DELETE /productFields

> **Operation ID:** `deleteProductFields`
> **Tags:** `ProductFields`

## Delete multiple product fields in bulk

Marks multiple fields as deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `ids` | string | query | Yes | The comma-separated field IDs to delete |

## Responses

**200** - Mark multiple product fields as deleted

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - array of integer
    Array of all the IDs of the deleted product fields
```


## Security

- **api_key**
- **oauth2**: products:full