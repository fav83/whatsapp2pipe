# DELETE /deals/{id}

> **Operation ID:** `deleteDeal`
> **Tags:** `Deals`

## Delete a deal

Marks a deal as deleted. After 30 days, the deal will be permanently deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Responses

**200** - Delete a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the deal that was deleted
```


## Security

- **api_key**
- **oauth2**: deals:full