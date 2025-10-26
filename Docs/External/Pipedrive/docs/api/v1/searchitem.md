# GET /itemSearch

> **Operation ID:** `searchItem`
> **Tags:** `ItemSearch`

## Perform a search from multiple item types

Performs a search from your choice of item types and fields.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `term` | string | query | Yes | The search term to look for. Minimum 2 characters (or 1 if using `exact_match`). Please note that the search term has to be URL encoded. |
| `item_types` | string (`deal`, `person`, `organization`, ...) | query | No | A comma-separated string array. The type of items to perform the search from. Defaults to all. |
| `fields` | string (`address`, `code`, `custom_fields`, ...) | query | No | A comma-separated string array. The fields to perform the search from. Defaults to all. Relevant for each item type are:<br> <table> <tr><th><b>Item type</b></th><th><b>Field</b></th></tr> <tr><td>Deal</td><td>`custom_fields`, `notes`, `title`</td></tr> <tr><td>Person</td><td>`custom_fields`, `email`, `name`, `notes`, `phone`</td></tr> <tr><td>Organization</td><td>`address`, `custom_fields`, `name`, `notes`</td></tr> <tr><td>Product</td><td>`code`, `custom_fields`, `name`</td></tr> <tr><td>Lead</td><td>`custom_fields`, `notes`, `title`</td></tr> <tr><td>File</td><td>`name`</td></tr> <tr><td>Mail attachment</td><td>`name`</td></tr> <tr><td>Project</td><td> `custom_fields`, `notes`, `title`, `description` </td></tr> </table> <br> Only the following custom field types are searchable: `address`, `varchar`, `text`, `varchar_auto`, `double`, `monetary` and `phone`. Read more about searching by custom fields <a href="https://support.pipedrive.com/en/article/search-finding-what-you-need#searching-by-custom-fields" target="_blank" rel="noopener noreferrer">here</a>. |
| `search_for_related_items` | boolean | query | No | When enabled, the response will include up to 100 newest related leads and 100 newest related deals for each found person and organization and up to 100 newest related persons for each found organization |
| `exact_match` | boolean | query | No | When enabled, only full exact matches against the given term are returned. It is <b>not</b> case sensitive. |
| `include_fields` | string (`deal.cc_email`, `person.picture`, `product.price`) | query | No | A comma-separated string array. Supports including optional fields in the results which are not provided by default. |
| `start` | integer | query | No | Pagination start. Note that the pagination is based on main results and does not include related items when using `search_for_related_items` parameter. |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: search:read