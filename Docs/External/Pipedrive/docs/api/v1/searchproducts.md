# GET /products/search

> **Operation ID:** `searchProducts`
> **Tags:** `Products`

## Search products

Searches all products by name, code and/or custom fields. This endpoint is a wrapper of <a href="https://developers.pipedrive.com/docs/api/v1/ItemSearch#searchItem">/v1/itemSearch</a> with a narrower OAuth scope.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `term` | string | query | Yes | The search term to look for. Minimum 2 characters (or 1 if using `exact_match`). Please note that the search term has to be URL encoded. |
| `fields` | string (`code`, `custom_fields`, `name`) | query | No | A comma-separated string array. The fields to perform the search from. Defaults to all of them. Only the following custom field types are searchable: `address`, `varchar`, `text`, `varchar_auto`, `double`, `monetary` and `phone`. Read more about searching by custom fields <a href="https://support.pipedrive.com/en/article/search-finding-what-you-need#searching-by-custom-fields" target="_blank" rel="noopener noreferrer">here</a>. |
| `exact_match` | boolean | query | No | When enabled, only full exact matches against the given term are returned. It is <b>not</b> case sensitive. |
| `include_fields` | string (`product.price`) | query | No | Supports including optional fields in the results which are not provided by default |
| `start` | integer | query | No | Pagination start. Note that the pagination is based on main results and does not include related items when using `search_for_related_items` parameter. |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: products:read, products:full, search:read