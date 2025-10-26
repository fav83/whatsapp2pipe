# GET /products/{id}/followers/changelog

> **Operation ID:** `getProductFollowersChangelog`
> **Tags:** `Products`

## List followers changelog of a product

Lists changelogs about users have followed the product.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the product |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - List entity followers

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: products:read, products:full