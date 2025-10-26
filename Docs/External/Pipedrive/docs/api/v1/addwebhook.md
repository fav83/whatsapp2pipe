# POST /webhooks

> **Operation ID:** `addWebhook`
> **Tags:** `Webhooks`

## Create a new Webhook

Creates a new Webhook and returns its details. Note that specifying an event which triggers the Webhook combines 2 parameters - `event_action` and `event_object`. E.g., use `*.*` for getting notifications about all events, `create.deal` for any newly added deals, `delete.persons` for any deleted persons, etc. See <a href="https://pipedrive.readme.io/docs/guide-for-webhooks-v2?ref=api_reference" target="_blank" rel="noopener noreferrer">the guide for Webhooks</a> for more details.

## Request Body

Content type: `application/json`

```
- **`subscription_url`** (**required**) - string
  A full, valid, publicly accessible URL which determines where to send the notifications. Please note that you cannot use Pipedrive API endpoints as the `subscription_url` and the chosen URL must not redirect to another link.
- **`event_action`** (**required**) - string
  The type of action to receive notifications about. Wildcard will match all supported actions.
  Allowed values: `create`, `change`, `delete`, `*`
- **`event_object`** (**required**) - string
  The type of object to receive notifications about. Wildcard will match all supported objects.
  Allowed values: `activity`, `deal`, `lead`, `note`, `organization`, `person`, `pipeline`, `product`, `stage`, `user`, `*`
- **`name`** (**required**) - string
  The webhook's name
- **`user_id`** (*optional*) - integer
  The ID of the user that this webhook will be authorized with. You have the option to use a different user's `user_id`. If it is not set, the current user's `user_id` will be used. As each webhook event is checked against a user's permissions, the webhook will only be sent if the user has access to the specified object(s). If you want to receive notifications for all events, please use a top-level admin user’s `user_id`.
- **`http_auth_user`** (*optional*) - string
  The HTTP basic auth username of the subscription URL endpoint (if required)
- **`http_auth_password`** (*optional*) - string
  The HTTP basic auth password of the subscription URL endpoint (if required)
- **`version`** (*optional*) - string
  The webhook's version. NB! Webhooks v2 is the default from March 17th, 2025. See <a href="https://developers.pipedrive.com/changelog/post/breaking-change-webhooks-v2-will-become-the-new-default-version" target="_blank" rel="noopener noreferrer">this Changelog post</a> for more details.
  Allowed values: `1.0`, `2.0`
```

## Responses

**201** - The created webhook object

Response type: `application/json`

```

```

**400** - The bad response on webhook creation

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


## Security

- **api_key**
- **oauth2**: admin