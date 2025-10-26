# DELETE /channels/{id}

> **Operation ID:** `deleteChannel`
> **Tags:** `Channels`

## Delete a channel

Deletes an existing messenger’s channel and all related entities (conversations and messages). To use the endpoint, you need to have **Messengers integration** OAuth scope enabled and the Messaging manifest ready for the [Messaging app extension](https://pipedrive.readme.io/docs/messaging-app-extension).

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the channel provided by the integration |

## Responses

**200** - The channel was deleted

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
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