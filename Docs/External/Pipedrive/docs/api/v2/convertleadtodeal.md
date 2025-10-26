# POST /leads/{id}/convert/deal

> **Operation ID:** `convertLeadToDeal`
> **Tags:** `Leads`, `Beta`

## Convert a lead to a deal (BETA)

Initiates a conversion of a lead to a deal. The return value is an ID of a job that was assigned to perform the conversion. Related entities (notes, files, emails, activities, ...) are transferred during the process to the target entity. If the conversion is successful, the lead is marked as deleted. To retrieve the created entity ID and the result of the conversion, call the <a href="https://developers.pipedrive.com/docs/api/v1/Leads#getLeadConversionStatus">/api/v2/leads/{lead_id}/convert/status/{conversion_id}</a> endpoint.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the lead to convert |

## Request Body

Content type: `application/json`

```
- **`stage_id`** (*optional*) - integer
  The ID of a stage the created deal will be added to. Please note that a pipeline will be assigned automatically based on the `stage_id`. If omitted, the deal will be placed in the first stage of the default pipeline.
- **`pipeline_id`** (*optional*) - integer
  The ID of a pipeline the created deal will be added to. By default, the deal will be added to the first stage of the specified pipeline. Please note that `pipeline_id` and `stage_id` should not be used together as `pipeline_id` will be ignored.
```

## Responses

**200** - Successful response containing payload in the `data` field

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  An object containing conversion job id that performs the conversion
  - **`conversion_id`** (**required**) - string
    The ID of the conversion job that can be used to retrieve conversion status and details. The ID has UUID format.
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
- **oauth2**: leads:full