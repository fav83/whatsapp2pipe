# POST /channels/messages/receive

> **Operation ID:** `receiveMessage`
> **Tags:** `Channels`

## Receives an incoming message

Adds a message to a conversation. To use the endpoint, you need to have **Messengers integration** OAuth scope enabled and the Messaging manifest ready for the [Messaging app extension](https://pipedrive.readme.io/docs/messaging-app-extension).

## Request Body

Content type: `application/json`

```
- **`id`** (**required**) - string
  The ID of the message
- **`channel_id`** (**required**) - string
  The channel ID as in the provider
- **`sender_id`** (**required**) - string
  The ID of the provider's user that sent the message
- **`conversation_id`** (**required**) - string
  The ID of the conversation
- **`message`** (**required**) - string
  The body of the message
- **`status`** (**required**) - string
  The status of the message
  Allowed values: `sent`, `delivered`, `read`, `failed`
- **`created_at`** (**required**) - string
  The date and time when the message was created in the provider, in UTC. Format: YYYY-MM-DD HH:MM
- **`reply_by`** (*optional*) - string
  The date and time when the message can no longer receive a reply, in UTC. Format: YYYY-MM-DD HH:MM
- **`conversation_link`** (*optional*) - string
  A URL that can open the conversation in the provider's side
- **`attachments`** (*optional*) - array of object
  The list of attachments available in the message
```

## Responses

**200** - The message was registered in the conversation

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (**required**) - string
    The ID of the message
  - **`channel_id`** (**required**) - string
    The channel ID as in the provider
  - **`sender_id`** (**required**) - string
    The ID of the provider's user that sent the message
  - **`conversation_id`** (**required**) - string
    The ID of the conversation
  - **`message`** (**required**) - string
    The body of the message
  - **`status`** (**required**) - string
    The status of the message
    Allowed values: `sent`, `delivered`, `read`, `failed`
  - **`created_at`** (**required**) - string
    The date and time when the message was created in the provider, in UTC. Format: YYYY-MM-DD HH:MM
  - **`reply_by`** (*optional*) - string
    The date and time when the message can no longer receive a reply, in UTC. Format: YYYY-MM-DD HH:MM
  - **`conversation_link`** (*optional*) - string
    A URL that can open the conversation in the provider's side
  - **`attachments`** (*optional*) - array of object
    The list of attachments available in the message
```

**400** - Bad Request

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