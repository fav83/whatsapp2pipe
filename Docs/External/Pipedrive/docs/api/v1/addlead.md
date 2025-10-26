# POST /leads

> **Operation ID:** `addLead`
> **Tags:** `Leads`

## Add a lead

Creates a lead. A lead always has to be linked to a person or an organization or both. All leads created through the Pipedrive API will have a lead source and origin set to `API`. Here's the tutorial for <a href="https://pipedrive.readme.io/docs/adding-a-lead" target="_blank" rel="noopener noreferrer">adding a lead</a>. If a lead contains custom fields, the fields' values will be included in the response in the same format as with the `Deals` endpoints. If a custom field's value hasn't been set for the lead, it won't appear in the response. Please note that leads do not have a separate set of custom fields, instead they inherit the custom fields' structure from deals. See an example given in the <a href="https://pipedrive.readme.io/docs/updating-custom-field-value" target="_blank" rel="noopener noreferrer">updating custom fields' values tutorial</a>.

## Request Body

Content type: `application/json`

```
- **`title`** (**required**) - string
  The name of the lead
- **`owner_id`** (*optional*) - integer
  The ID of the user which will be the owner of the created lead. If not provided, the user making the request will be used.
- **`label_ids`** (*optional*) - array of string
  The IDs of the lead labels which will be associated with the lead
- **`person_id`** (*optional*) - integer
  The ID of a person which this lead will be linked to. If the person does not exist yet, it needs to be created first. This property is required unless `organization_id` is specified.
- **`organization_id`** (*optional*) - integer
  The ID of an organization which this lead will be linked to. If the organization does not exist yet, it needs to be created first. This property is required unless `person_id` is specified.
- **`value`** (*optional*) - object
  The potential value of the lead represented by a JSON object: `{ "amount": 200, "currency": "EUR" }`. Both amount and currency are required.
  - **`amount`** (**required**) - number
  - **`currency`** (**required**) - string
- **`expected_close_date`** (*optional*) - string
  The date of when the deal which will be created from the lead is expected to be closed. In ISO 8601 format: YYYY-MM-DD.
- **`visible_to`** (*optional*) - string
  The visibility of the lead. If omitted, the visibility will be set to the default visibility setting of this item type for the authorized user. Read more about visibility groups <a href="https://support.pipedrive.com/en/article/visibility-groups" target="_blank" rel="noopener noreferrer">here</a>.<h4>Light / Growth and Professional plans</h4><table><tr><th style="width: 40px">Value</th><th>Description</th></tr><tr><td>`1`</td><td>Owner &amp; followers</td><tr><td>`3`</td><td>Entire company</td></tr></table><h4>Premium / Ultimate plan</h4><table><tr><th style="width: 40px">Value</th><th>Description</th></tr><tr><td>`1`</td><td>Owner only</td><tr><td>`3`</td><td>Owner's visibility group</td></tr><tr><td>`5`</td><td>Owner's visibility group and sub-groups</td></tr><tr><td>`7`</td><td>Entire company</td></tr></table>
- **`was_seen`** (*optional*) - boolean
  A flag indicating whether the lead was seen by someone in the Pipedrive UI
- **`origin_id`** (*optional*) - string
  The optional ID to further distinguish the origin of the lead - e.g. Which API integration created this lead. If omitted, `origin_id` will be set to null.
- **`channel`** (*optional*) - integer
  The ID of Marketing channel this lead was created from. Provided value must be one of the channels configured for your company. You can fetch allowed values with <a href="https://developers.pipedrive.com/docs/api/v1/DealFields#getDealField" target="_blank" rel="noopener noreferrer">GET /v1/dealFields</a>. If omitted, channel will be set to null.
- **`channel_id`** (*optional*) - string
  The optional ID to further distinguish the Marketing channel. If omitted, `channel_id` will be set to null.
```

## Responses

**201** - Successful response containing payload in the `data` field

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


## Security

- **api_key**
- **oauth2**: leads:full