# POST /activities

> **Operation ID:** `addActivity`
> **Tags:** `Activities`

## Add an activity

Adds a new activity. Includes `more_activities_scheduled_in_context` property in response's `additional_data` which indicates whether there are more undone activities scheduled with the same deal, person or organization (depending on the supplied data). For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/adding-an-activity" target="_blank" rel="noopener noreferrer">adding an activity</a>. <br /> <br /> ***Starting from 30.09.2024, activity attendees will receive updates only if the activity owner has an active calendar sync***

## Request Body

Content type: `application/json`

```

```

## Responses

**201** - Created

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - any
- **`additional_data`** (*optional*) - object
  - **`updates_story_id`** (*optional*) - integer
    This field will be deprecated
- **`related_objects`** (*optional*) - object
  - **`user`** (*optional*) - object
    - **`USER_ID`** (*optional*) - object

  - **`deal`** (*optional*) - object
    - **`DEAL_ID`** (*optional*) - object
      The ID of the deal which is associated with the item
      - **`id`** (*optional*) - integer
        The ID of the deal associated with the item
      - **`title`** (*optional*) - string
        The title of the deal associated with the item
      - **`status`** (*optional*) - string
        The status of the deal associated with the item
      - **`value`** (*optional*) - number
        The value of the deal that is associated with the item
      - **`currency`** (*optional*) - string
        The currency of the deal value
      - **`stage_id`** (*optional*) - integer
        The ID of the stage the deal is currently at
      - **`pipeline_id`** (*optional*) - integer
        The ID of the pipeline the deal is in
  - **`person`** (*optional*) - object
    - **`PERSON_ID`** (*optional*) - object
      The ID of the person associated with the item

  - **`organization`** (*optional*) - object
    - **`ORGANIZATION_ID`** (*optional*) - object
      The ID of the organization associated with the item

```


## Security

- **api_key**
- **oauth2**: activities:full