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

**200** - Delete deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    Deleted deal ID
```


## Security

- **api_key**
- **oauth2**: deals:full