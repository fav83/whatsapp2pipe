# DELETE /webhooks/{id}

> **Operation ID:** `deleteWebhook`
> **Tags:** `Webhooks`

## Delete existing Webhook

Deletes the specified Webhook.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the Webhook to delete |

## Responses

**200** - The webhook deletion success response

Response type: `application/json`

```

```

**401** - Unauthorized response

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`error`** (*optional*) - string
  The error message
- **`errorCode`** (*optional*) - integer
  The response error code
```

**403** - The webhook deletion forbidden response

Response type: `application/json`

```

```

**404** - The webhook deletion not found response

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin