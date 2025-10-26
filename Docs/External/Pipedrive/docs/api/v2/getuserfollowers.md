# GET /users/{id}/followers

> **Operation ID:** `getUserFollowers`
> **Tags:** `Users`

## List followers of a user

Lists users who are following the user.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the user |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - List entity followers

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: users:read