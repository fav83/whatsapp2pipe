# DELETE /persons/{id}

> **Operation ID:** `deletePerson`
> **Tags:** `Persons`

## Delete a person

Marks a person as deleted. After 30 days, the person will be permanently deleted.

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
- **oauth2**: contacts:full