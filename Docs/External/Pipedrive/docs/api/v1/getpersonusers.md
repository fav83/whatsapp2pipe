# GET /persons/{id}/permittedUsers

> **Operation ID:** `getPersonUsers`
> **Tags:** `Persons`

## List permitted users

List users permitted to access a person.

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