# POST /deals

> **Operation ID:** `addDeal`
> **Tags:** `Deals`

## Add a new deal

Adds a new deal.

## Request Body

Content type: `application/json`

```
- **`title`** (**required**) - string
  The title of the deal
- **`owner_id`** (*optional*) - integer
  The ID of the user who owns the deal
- **`person_id`** (*optional*) - integer
  The ID of the person linked to the deal
- **`org_id`** (*optional*) - integer
  The ID of the organization linked to the deal
- **`pipeline_id`** (*optional*) - integer
  The ID of the pipeline associated with the deal
- **`stage_id`** (*optional*) - integer
  The ID of the deal stage
- **`value`** (*optional*) - number
  The value of the deal
- **`currency`** (*optional*) - string
  The currency associated with the deal
- **`is_deleted`** (*optional*) - boolean
  Whether the deal is deleted or not
- **`is_archived`** (*optional*) - boolean
  Whether the deal is archived or not
- **`archive_time`** (*optional*) - string
  The optional date and time of archiving the deal in UTC. Format: YYYY-MM-DD HH:MM:SS. If omitted and `is_archived` is true, it will be set to the current date and time.
- **`status`** (*optional*) - string
  The status of the deal
- **`probability`** (*optional*) - number
  The success probability percentage of the deal
- **`lost_reason`** (*optional*) - string
  The reason for losing the deal. Can only be set if deal status is lost.
- **`visible_to`** (*optional*) - integer
  The visibility of the deal
- **`close_time`** (*optional*) - string
  The date and time of closing the deal. Can only be set if deal status is won or lost.
- **`won_time`** (*optional*) - string
  The date and time of changing the deal status as won. Can only be set if deal status is won.
- **`lost_time`** (*optional*) - string
  The date and time of changing the deal status as lost. Can only be set if deal status is lost.
- **`expected_close_date`** (*optional*) - string
  The expected close date of the deal
- **`label_ids`** (*optional*) - array of integer
  The IDs of labels assigned to the deal
- **`custom_fields`** (*optional*) - object
  An object where each key represents a custom field. All custom fields are referenced as randomly generated 40-character hashes

```

## Responses

**200** - Add deal

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:full