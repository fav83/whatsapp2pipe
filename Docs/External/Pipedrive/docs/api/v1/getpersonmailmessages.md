# GET /persons/{id}/mailMessages

> **Operation ID:** `getPersonMailMessages`
> **Tags:** `Persons`

## List mail messages associated with a person

Lists mail messages associated with a person.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: mail:read, mail:full