# GET /deals/{id}/convert/status/{conversion_id}

> **Operation ID:** `getDealConversionStatus`
> **Tags:** `Deals`, `Beta`

## Get Deal conversion status (BETA)

Returns information about the conversion. Status is always present and its value (not_started, running, completed, failed, rejected) represents the current state of the conversion. Lead ID is only present if the conversion was successfully finished. This data is only temporary and removed after a few days.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of a deal |
| `conversion_id` | string | path | Yes | The ID of the conversion |

## Responses

**200** - Successful response containing payload in the `data` field

Response type: `application/json`

```
- **`success`** (**required**) - boolean
- **`data`** (**required**) - object
  An object containing conversion status. After successful conversion the converted entity ID is also present.
  - **`lead_id`** (*optional*) - string
    The ID of the new lead.
  - **`deal_id`** (*optional*) - integer
    The ID of the new deal.
  - **`conversion_id`** (**required**) - string
    The ID of the conversion job. The ID can be used to retrieve conversion status and details. The ID has UUID format.
  - **`status`** (**required**) - string
    Status of the conversion job.
    Allowed values: `not_started`, `running`, `completed`, `failed`, `rejected`
- **`additional_data`** (*optional*) - object

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
- **oauth2**: deals:full, deals:read