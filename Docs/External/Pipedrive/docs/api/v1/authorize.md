# GET /oauth/authorize

> **Operation ID:** `authorize`
> **Tags:** `Oauth`

## Requesting authorization

Authorize a user by redirecting them to the Pipedrive OAuth authorization page and request their permissions to act on their behalf. This step is necessary to implement only when you allow app installation outside of the Marketplace.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `client_id` | string | query | Yes | The client ID provided to you by the Pipedrive Marketplace when you register your app |
| `redirect_uri` | string | query | Yes | The callback URL you provided when you registered your app. Authorization code will be sent to that URL (if it matches with the value you entered in the registration form) if a user approves the app install. Or, if a customer declines, the corresponding error will also be sent to this URL. |
| `state` | string | query | No | You may pass any random string as the state parameter and the same string will be returned to your app after a user authorizes access. It may be used to store the user's session ID from your app or distinguish different responses. Using state may increase security; see RFC-6749.  |

## Responses

**200** - Authorize user in the app.

