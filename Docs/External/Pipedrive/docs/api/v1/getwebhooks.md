# GET /webhooks

> **Operation ID:** `getWebhooks`
> **Tags:** `Webhooks`

## Get all Webhooks

Returns data about all the Webhooks of a company.

## Responses

**200** - The list of webhooks objects from the logged in company and user

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