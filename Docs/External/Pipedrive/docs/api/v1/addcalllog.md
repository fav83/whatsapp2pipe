# POST /callLogs

> **Operation ID:** `addCallLog`
> **Tags:** `CallLogs`

## Add a call log

Adds a new call log.

## Request Body

Content type: `application/json`

```
- **`user_id`** (*optional*) - integer
  The ID of the owner of the call log. Please note that a user without account settings access cannot create call logs for other users.
- **`activity_id`** (*optional*) - integer
  If specified, this activity will be converted into a call log, with the information provided. When this field is used, you don't need to specify `deal_id`, `person_id` or `org_id`, as they will be ignored in favor of the values already available in the activity. The `activity_id` must refer to a `call` type activity.
- **`subject`** (*optional*) - string
  The name of the activity this call is attached to
- **`duration`** (*optional*) - string
  The duration of the call in seconds
- **`outcome`** (**required**) - string
  Describes the outcome of the call
  Allowed values: `connected`, `no_answer`, `left_message`, `left_voicemail`, `wrong_number`, `busy`
- **`from_phone_number`** (*optional*) - string
  The number that made the call
- **`to_phone_number`** (**required**) - string
  The number called
- **`start_time`** (**required**) - string
  The date and time of the start of the call in UTC. Format: YYYY-MM-DD HH:MM:SS.
- **`end_time`** (**required**) - string
  The date and time of the end of the call in UTC. Format: YYYY-MM-DD HH:MM:SS.
- **`person_id`** (*optional*) - integer
  The ID of the person this call is associated with
- **`org_id`** (*optional*) - integer
  The ID of the organization this call is associated with
- **`deal_id`** (*optional*) - integer
  The ID of the deal this call is associated with. A call log can be associated with either a deal or a lead, but not both at once.
- **`lead_id`** (*optional*) - string
  The ID of the lead in the UUID format this call is associated with. A call log can be associated with either a deal or a lead, but not both at once.
- **`note`** (*optional*) - string
  The note for the call log in HTML format
```

## Responses

**200** - The call log was successfully created.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the response is successful or not
- **`data`** (*optional*) - any
```

**400** - The request contains wrong or incorrectly formatted arguments.

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

**403** - You don't have permission to access the resource.

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