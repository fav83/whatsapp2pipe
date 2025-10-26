# GET /mailbox/mailThreads/{id}

> **Operation ID:** `getMailThread`
> **Tags:** `Mailbox`

## Get one mail thread

Returns a specific mail thread.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the mail thread |

## Responses

**200** - Get mail threads

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: mail:read, mail:full