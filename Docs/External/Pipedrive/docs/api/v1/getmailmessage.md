# GET /mailbox/mailMessages/{id}

> **Operation ID:** `getMailMessage`
> **Tags:** `Mailbox`

## Get one mail message

Returns data about a specific mail message.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the mail message to fetch |
| `include_body` | number (`0`, `1`) | query | No | Whether to include the full message body or not. `0` = Don't include, `1` = Include. |

## Responses

**200** - The mail messages that are being synced with Pipedrive

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: mail:read, mail:full