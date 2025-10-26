# GET /users/find

> **Operation ID:** `findUsersByName`
> **Tags:** `Users`

## Find users by name

Finds users by their name.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `term` | string | query | Yes | The search term to look for |
| `search_by_email` | number (`0`, `1`) | query | No | When enabled, the term will only be matched against email addresses of users. Default: `false`. |

## Responses

**200** - The list of user objects

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: users:read