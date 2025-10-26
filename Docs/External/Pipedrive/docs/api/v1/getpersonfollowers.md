# GET /persons/{id}/followers

> **Operation ID:** `getPersonFollowers`
> **Tags:** `Persons`

## List followers of a person

Lists the followers of a person.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full