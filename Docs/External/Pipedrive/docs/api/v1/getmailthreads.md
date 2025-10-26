# GET /mailbox/mailThreads

> **Operation ID:** `getMailThreads`
> **Tags:** `Mailbox`

## Get mail threads

Returns mail threads in a specified folder ordered by the most recent message within.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `folder` | string (`inbox`, `drafts`, `sent`, ...) | query | Yes | The type of folder to fetch |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Get mail threads

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: mail:read, mail:full