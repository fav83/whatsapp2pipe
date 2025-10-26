# POST /channels

> **Operation ID:** `addChannel`
> **Tags:** `Channels`

## Add a channel

Adds a new messaging channel, only admins are able to register new channels. It will use the getConversations endpoint to fetch conversations, participants and messages afterward. To use the endpoint, you need to have **Messengers integration** OAuth scope enabled and the Messaging manifest ready for the [Messaging app extension](https://pipedrive.readme.io/docs/messaging-app-extension).

## Request Body

Content type: `application/json`

```
- **`name`** (**required**) - string
  The name of the channel
- **`provider_channel_id`** (**required**) - string
  The channel ID
- **`avatar_url`** (*optional*) - string
  The URL for an icon that represents your channel
- **`template_support`** (*optional*) - boolean
  If true, enables templates logic on UI. Requires getTemplates endpoint implemented. Find out more [here](https://pipedrive.readme.io/docs/implementing-messaging-app-extension).
- **`provider_type`** (*optional*) - string
  It controls the icons (like the icon next to the conversation)
  Allowed values: `facebook`, `whatsapp`, `other`
```

## Responses

**200** - The channel registered

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - string
    The unique channel ID used internally in omnichannel-api and the frontend of the extension
  - **`name`** (*optional*) - string
    The name of the channel
  - **`avatar_url`** (*optional*) - string
    The URL for an icon that represents your channel
  - **`provider_channel_id`** (*optional*) - string
    The channel ID you specified while creating the channel
  - **`marketplace_client_id`** (*optional*) - string
    The client_id of your app in Pipedrive marketplace
  - **`pd_company_id`** (*optional*) - integer
    The ID of the user's company in Pipedrive
  - **`pd_user_id`** (*optional*) - integer
    The ID of the user in Pipedrive
  - **`created_at`** (*optional*) - string
    The date and time when your channel was created in the API
  - **`provider_type`** (*optional*) - string
    Value of the provider_type sent to this endpoint
    Allowed values: `facebook`, `whatsapp`, `other`
  - **`template_support`** (*optional*) - boolean
    Value of the template_support sent to this endpoint
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


## Security

- **api_key**
- **oauth2**: messengers-integration