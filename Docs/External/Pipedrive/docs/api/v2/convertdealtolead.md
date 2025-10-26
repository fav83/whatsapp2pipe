# POST /deals/{id}/convert/lead

> **Operation ID:** `convertDealToLead`
> **Tags:** `Deals`, `Beta`

## Convert a deal to a lead (BETA)

Initiates a conversion of a deal to a lead. The return value is an ID of a job that was assigned to perform the conversion. Related entities (notes, files, emails, activities, ...) are transferred during the process to the target entity. There are exceptions for entities like invoices or history that are not transferred and remain linked to the original deal. If the conversion is successful, the deal is marked as deleted. To retrieve the created entity ID and the result of the conversion, call the <a href="https://developers.pipedrive.com/docs/api/v1/Deals#getDealConversionStatus">/api/v2/deals/{deal_id}/convert/status/{conversion_id}</a> endpoint.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal to convert |

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
- **oauth2**: deals:full