# DELETE /channels/{channel-id}/conversations/{conversation-id}

> **Operation ID:** `deleteConversation`
> **Tags:** `Channels`

## Delete a conversation

Deletes an existing conversation. To use the endpoint, you need to have **Messengers integration** OAuth scope enabled and the Messaging manifest ready for the [Messaging app extension](https://pipedrive.readme.io/docs/messaging-app-extension).

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `channel-id` | string | path | Yes | The ID of the channel provided by the integration |
| `conversation-id` | string | path | Yes | The ID of the conversation provided by the integration |

## Responses

**200** - The conversation was deleted

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
```

**403** - Forbidden

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`error`** (*optional*) - string
  The error description
- **`error_info`** (*optional*) - string
- **`additional_data`** (*optional*) - object
  - **`code`** (*optional*) - string
    An error code sent by the API
```

**404** - Not Found

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`error`** (*optional*) - string
  The error description
- **`error_info`** (*optional*) - string
- **`additional_data`** (*optional*) - object
  - **`code`** (*optional*) - string
    An error code sent by the API
```


## Security

- **api_key**
- **oauth2**: messengers-integration