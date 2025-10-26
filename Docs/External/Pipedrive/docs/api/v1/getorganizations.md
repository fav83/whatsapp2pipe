# GET /organizations

> **Operation ID:** `getOrganizations`
> **Tags:** `Organizations`

## Get all organizations

Returns all organizations.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `user_id` | integer | query | No | If supplied, only organizations owned by the given user will be returned. However, `filter_id` takes precedence over `user_id` when both are supplied. |
| `filter_id` | integer | query | No | The ID of the filter to use |
| `first_char` | string | query | No | If supplied, only organizations whose name starts with the specified letter will be returned (case-insensitive) |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `sort` | string | query | No | The field names and sorting mode separated by a comma (`field_name_1 ASC`, `field_name_2 DESC`). Only first-level field keys are supported (no nested keys). |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full