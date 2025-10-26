# GET /users/me

> **Operation ID:** `getCurrentUser`
> **Tags:** `Users`

## Get current user data

Returns data about an authorized user within the company with bound company data: company ID, company name, and domain. Note that the `locale` property means 'Date/number format' in the Pipedrive account settings, not the chosen language.

## Responses

**200** - The data of the logged in user

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
- **oauth2**: base