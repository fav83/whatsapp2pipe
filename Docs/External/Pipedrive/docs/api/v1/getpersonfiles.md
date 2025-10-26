# GET /persons/{id}/files

> **Operation ID:** `getPersonFiles`
> **Tags:** `Persons`

## List files attached to a person

Lists files associated with a person.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page. Please note that a maximum value of 100 is allowed. |
| `sort` | string | query | No | Supported fields: `id`, `update_time` |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full