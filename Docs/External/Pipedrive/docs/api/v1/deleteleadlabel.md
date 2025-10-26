# DELETE /leadLabels/{id}

> **Operation ID:** `deleteLeadLabel`
> **Tags:** `LeadLabels`

## Delete a lead label

Deletes a specific lead label.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the lead label |

## Responses

**200** - Successful response with id value only. Used in DELETE calls.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - string
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