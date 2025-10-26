# PUT /mailbox/mailThreads/{id}

> **Operation ID:** `updateMailThreadDetails`
> **Tags:** `Mailbox`

## Update mail thread details

Updates the properties of a mail thread.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the mail thread |

## Request Body

Content type: `application/x-www-form-urlencoded`

```
- **`deal_id`** (*optional*) - integer
  The ID of the deal this thread is associated with
- **`lead_id`** (*optional*) - string
  The ID of the lead this thread is associated with
- **`shared_flag`** (*optional*) - any
  Whether this thread is shared with other users in your company
- **`read_flag`** (*optional*) - any
  Whether this thread is read or unread
- **`archived_flag`** (*optional*) - any
  Whether this thread is archived or not. You can only archive threads that belong to Inbox folder. Archived threads will disappear from Inbox.
```

## Responses

**200** - Updates the properties of a mail thread

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: mail:full