# PATCH /organizations/{id}

> **Operation ID:** `updateOrganization`
> **Tags:** `Organizations`

## Update a organization

Updates the properties of a organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |

## Request Body

Content type: `application/json`

```
- **`name`** (*optional*) - string
  The name of the organization
- **`owner_id`** (*optional*) - integer
  The ID of the user who owns the organization
- **`add_time`** (*optional*) - string
  The creation date and time of the organization
- **`update_time`** (*optional*) - string
  The last updated date and time of the organization
- **`visible_to`** (*optional*) - integer
  The visibility of the organization
- **`label_ids`** (*optional*) - array of integer
  The IDs of labels assigned to the organization
- **`address`** (*optional*) - object
  The address of the organization
  - **`value`** (*optional*) - string
    The full address of the organization
  - **`country`** (*optional*) - string
    Country of the organization
  - **`admin_area_level_1`** (*optional*) - string
    Admin area level 1 (e.g. state) of the organization
  - **`admin_area_level_2`** (*optional*) - string
    Admin area level 2 (e.g. county) of the organization
  - **`locality`** (*optional*) - string
    Locality (e.g. city) of the organization
  - **`sublocality`** (*optional*) - string
    Sublocality (e.g. neighborhood) of the organization
  - **`route`** (*optional*) - string
    Route (e.g. street) of the organization
  - **`street_number`** (*optional*) - string
    Street number of the organization
  - **`postal_code`** (*optional*) - string
    Postal code of the organization
- **`custom_fields`** (*optional*) - object
  An object where each key represents a custom field. All custom fields are referenced as randomly generated 40-character hashes

```

## Responses

**200** - Edit organization

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full