# POST /callLogs/{id}/recordings

> **Operation ID:** `addCallLogAudioFile`
> **Tags:** `CallLogs`

## Attach an audio file to the call log

Adds an audio recording to the call log. That audio can be played by those who have access to the call log object.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID received when you create the call log |

## Request Body

Content type: `multipart/form-data`

```
- **`file`** (**required**) - string
  Audio file supported by the HTML5 specification
```

## Responses

**200** - The audio recording was successfully added to the log.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
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

**409** - Recording for this call already exists.

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

**500** - There was an error processing the request.

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