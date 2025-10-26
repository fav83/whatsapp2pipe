# GET /callLogs/{id}

> **Operation ID:** `getCallLog`
> **Tags:** `CallLogs`

## Get details of a call log

Returns details of a specific call log.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID received when you create the call log |

## Responses

**200** - The requested call log object.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
```

**404** - A resource required to process the request was not found.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`error`** (*optional*) - string
  The description of the error
- **`error_info`** (*optional*) - string
  A message describing how to solve the problem
- **`data`** (*optional*) - object

- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: phone-integration