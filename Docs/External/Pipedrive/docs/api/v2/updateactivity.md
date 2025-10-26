# PATCH /activities/{id}

> **Operation ID:** `updateActivity`
> **Tags:** `Activities`

## Update an activity

Updates the properties of an activity.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the activity |

## Request Body

Content type: `application/json`

```
- **`subject`** (*optional*) - string
  The subject of the activity
- **`type`** (*optional*) - string
  The type of the activity
- **`owner_id`** (*optional*) - integer
  The ID of the user who owns the activity
- **`deal_id`** (*optional*) - integer
  The ID of the deal linked to the activity
- **`lead_id`** (*optional*) - string
  The ID of the lead linked to the activity
- **`person_id`** (*optional*) - integer
  The ID of the person linked to the activity
- **`org_id`** (*optional*) - integer
  The ID of the organization linked to the activity
- **`project_id`** (*optional*) - integer
  The ID of the project linked to the activity
- **`due_date`** (*optional*) - string
  The due date of the activity
- **`due_time`** (*optional*) - string
  The due time of the activity
- **`duration`** (*optional*) - string
  The duration of the activity
- **`busy`** (*optional*) - boolean
  Whether the activity marks the assignee as busy or not in their calendar
- **`done`** (*optional*) - boolean
  Whether the activity is marked as done or not
- **`location`** (*optional*) - object
  Location of the activity
  - **`value`** (*optional*) - string
    The full address of the activity
  - **`country`** (*optional*) - string
    Country of the activity
  - **`admin_area_level_1`** (*optional*) - string
    Admin area level 1 (e.g. state) of the activity
  - **`admin_area_level_2`** (*optional*) - string
    Admin area level 2 (e.g. county) of the activity
  - **`locality`** (*optional*) - string
    Locality (e.g. city) of the activity
  - **`sublocality`** (*optional*) - string
    Sublocality (e.g. neighborhood) of the activity
  - **`route`** (*optional*) - string
    Route (e.g. street) of the activity
  - **`street_number`** (*optional*) - string
    Street number of the activity
  - **`postal_code`** (*optional*) - string
    Postal code of the activity
- **`participants`** (*optional*) - array of object
  The participants of the activity
- **`attendees`** (*optional*) - array of object
  The attendees of the activity
- **`public_description`** (*optional*) - string
  The public description of the activity
- **`priority`** (*optional*) - integer
  The priority of the activity. Mappable to a specific string using activityFields API.
- **`note`** (*optional*) - string
  The note of the activity
```

## Responses

**200** - Edit activity

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: activities:full