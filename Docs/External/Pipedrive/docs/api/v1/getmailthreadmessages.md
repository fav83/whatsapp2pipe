# GET /mailbox/mailThreads/{id}/mailMessages

> **Operation ID:** `getMailThreadMessages`
> **Tags:** `Mailbox`

## Get all mail messages of mail thread

Returns all the mail messages inside a specified mail thread.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the mail thread |

## Responses

**200** - Get mail messages from thread

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: mail:read, mail:full