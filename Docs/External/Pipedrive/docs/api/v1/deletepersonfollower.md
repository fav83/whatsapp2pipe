# DELETE /persons/{id}/followers/{follower_id}

> **Operation ID:** `deletePersonFollower`
> **Tags:** `Persons`

## Delete a follower from a person

Deletes a follower from a person.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |
| `follower_id` | integer | path | Yes | The ID of the relationship between the follower and the person |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full