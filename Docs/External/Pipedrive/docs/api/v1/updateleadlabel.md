# PATCH /leadLabels/{id}

> **Operation ID:** `updateLeadLabel`
> **Tags:** `LeadLabels`

## Update a lead label

Updates one or more properties of a lead label. Only properties included in the request will be updated.


## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the lead label |

## Request Body

Content type: `application/json`

```
- **`name`** (*optional*) - string
  The name of the lead label
- **`color`** (*optional*) - string
  The color of the label. Only a subset of colors can be used.
  Allowed values: `blue`, `brown`, `dark-gray`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `yellow`
```

## Responses

**200** - Successful response containing payload in the `data` field

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - string
    The unique ID of the lead label
  - **`name`** (*optional*) - string
    The name of the lead label
  - **`color`** (*optional*) - string
    The color of the label. Only a subset of colors can be used.
    Allowed values: `blue`, `brown`, `dark-gray`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `yellow`
  - **`add_time`** (*optional*) - string
    The date and time of when the lead label was created. In ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
  - **`update_time`** (*optional*) - string
    The date and time of when the lead label was last updated. In ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
```

**404** - A resource describing an error

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
- **oauth2**: leads:full