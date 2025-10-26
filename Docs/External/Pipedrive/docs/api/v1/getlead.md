# GET /leads/{id}

> **Operation ID:** `getLead`
> **Tags:** `Leads`

## Get one lead

Returns details of a specific lead. If a lead contains custom fields, the fields' values will be included in the response in the same format as with the `Deals` endpoints. If a custom field's value hasn't been set for the lead, it won't appear in the response. Please note that leads do not have a separate set of custom fields, instead they inherit the custom fields’ structure from deals.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | string | path | Yes | The ID of the lead |

## Responses

**200** - Successful response containing payload in the `data` field

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - string
    The unique ID of the lead in the UUID format
  - **`title`** (*optional*) - string
    The title of the lead
  - **`owner_id`** (*optional*) - integer
    The ID of the user who owns the lead
  - **`creator_id`** (*optional*) - integer
    The ID of the user who created the lead
  - **`label_ids`** (*optional*) - array of string
    The IDs of the lead labels which are associated with the lead
  - **`person_id`** (*optional*) - integer
    The ID of a person which this lead is linked to
  - **`organization_id`** (*optional*) - integer
    The ID of an organization which this lead is linked to
  - **`source_name`** (*optional*) - string
    Defines where the lead comes from. Will be `API` if the lead was created through the Public API and will be `Manually created` if the lead was created manually through the UI.

  - **`origin`** (*optional*) - string
    The way this Lead was created. `origin` field is set by Pipedrive when Lead is created and cannot be changed.
  - **`origin_id`** (*optional*) - string
    The optional ID to further distinguish the origin of the lead - e.g. Which API integration created this Lead.
  - **`channel`** (*optional*) - integer
    The ID of your Marketing channel this Lead was created from. Recognized Marketing channels can be configured in your <a href="https://app.pipedrive.com/settings/fields" target="_blank" rel="noopener noreferrer">Company settings</a>.
  - **`channel_id`** (*optional*) - string
    The optional ID to further distinguish the Marketing channel.
  - **`is_archived`** (*optional*) - boolean
    A flag indicating whether the lead is archived or not
  - **`was_seen`** (*optional*) - boolean
    A flag indicating whether the lead was seen by someone in the Pipedrive UI
  - **`value`** (*optional*) - object
    The potential value of the lead represented by a JSON object: `{ "amount": 200, "currency": "EUR" }`. Both amount and currency are required.
    - **`amount`** (**required**) - number
    - **`currency`** (**required**) - string
  - **`expected_close_date`** (*optional*) - string
    The date of when the deal which will be created from the lead is expected to be closed. In ISO 8601 format: YYYY-MM-DD.
  - **`next_activity_id`** (*optional*) - integer
    The ID of the next activity associated with the lead
  - **`add_time`** (*optional*) - string
    The date and time of when the lead was created. In ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
  - **`update_time`** (*optional*) - string
    The date and time of when the lead was last updated. In ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
  - **`visible_to`** (*optional*) - string
    The visibility of the lead. If omitted, the visibility will be set to the default visibility setting of this item type for the authorized user.<table><tr><th>Value</th><th>Description</th></tr><tr><td>`1`</td><td>Owner &amp; followers (private)</td></tr><tr><td>`3`</td><td>Entire company (shared)</td></tr></table>
  - **`cc_email`** (*optional*) - string
    The BCC email of the lead
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
- **oauth2**: leads:read, leads:full