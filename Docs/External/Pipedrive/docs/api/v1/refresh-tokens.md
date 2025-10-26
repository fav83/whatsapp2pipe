# POST /oauth/token/

> **Operation ID:** `refresh-tokens`
> **Tags:** `Oauth`

## Refreshing the tokens

The `access_token` has a lifetime. After a period of time, which was returned to you in `expires_in` JSON property, the `access_token` will be invalid, and you can no longer use it to get data from our API. To refresh the `access_token`, you must use the `refresh_token`.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `Authorization` | string | header | Yes | Base 64 encoded string containing the `client_id` and `client_secret` values. The header value should be `Basic <base64(client_id:client_secret)>`. |

## Request Body

Content type: `application/x-www-form-urlencoded`

```
- **`grant_type`** (*optional*) - string
  Since you are to refresh your access_token, you must use the value "refresh_token"
  Allowed values: `authorization_code`, `refresh_token`
- **`refresh_token`** (*optional*) - string
  The refresh token that you received after you exchanged the authorization code
```

## Responses

**200** - Returns user Oauth2 tokens.

Response type: `application/json`

```
- **`access_token`** (*optional*) - string
  You need to use an `access_token` for accessing the user's data via API. You will need to [refresh the access token](https://pipedrive.readme.io/docs/marketplace-oauth-authorization#step-7-refreshing-the-tokens) if the `access_token` becomes invalid.
- **`token_type`** (*optional*) - string
  The format of the token. Always "Bearer".
- **`refresh_token`** (*optional*) - string
  A refresh token is needed when you refresh the access token. refresh_token will expire if it isn't used in 60 days. Each time refresh_token is used, its expiry date is reset back to 60 days.
- **`scope`** (*optional*) - string
  List of scopes to which users have agreed to grant access within this `access_token`
- **`expires_in`** (*optional*) - integer
  The maximum time in seconds until the `access_token` expires
- **`api_domain`** (*optional*) - string
  The base URL path, including the company_domain, where the requests can be sent to
```


## Security

- **basic_authentication**