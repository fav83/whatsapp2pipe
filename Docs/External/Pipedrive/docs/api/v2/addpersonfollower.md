# POST /persons/{id}/followers

> **Operation ID:** `addPersonFollower`
> **Tags:** `Persons`

## Add a follower to a person

Adds a user as a follower to the person.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |

## Request Body

Content type: `application/json`

```
- **`user_id`** (**required**) - integer
  The ID of the user to add as a follower
```

## Responses

**201** - Add a follower

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full