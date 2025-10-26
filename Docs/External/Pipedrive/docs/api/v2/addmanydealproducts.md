# POST /deals/{id}/products/bulk

> **Operation ID:** `addManyDealProducts`
> **Tags:** `Deals`

## Add multiple products to a deal

Adds multiple products to a deal in a single request. Maximum of 100 products allowed per request.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |

## Request Body

Content type: `application/json`

```
- **`data`** (**required**) - array of any
  Array of products to attach to the deal. See the single product endpoint (https://developers.pipedrive.com/docs/api/v1/Deals#addDealProduct) for the expected format of array items.
```

## Responses

**201** - Add many products to a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - array of any
  Array of created deal products
```


## Security

- **api_key**
- **oauth2**: products:full, deals:full