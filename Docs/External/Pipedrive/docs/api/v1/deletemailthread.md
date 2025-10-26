# DELETE /mailbox/mailThreads/{id}

> **Operation ID:** `deleteMailThread`
> **Tags:** `Mailbox`

## Delete mail thread

Marks a mail thread as deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the mail thread |

## Responses

**200** - Marks mail thread as deleted

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: mail:full