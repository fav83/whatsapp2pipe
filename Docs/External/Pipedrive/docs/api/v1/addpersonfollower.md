# POST /persons/{id}/followers

> **Operation ID:** `addPersonFollower`
> **Tags:** `Persons`

## Add a follower to a person

Adds a follower to a person.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |

## Request Body

Content type: `application/json`

```
- **`user_id`** (**required**) - integer
  The ID of the user
```

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full