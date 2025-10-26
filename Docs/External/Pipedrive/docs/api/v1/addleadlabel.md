# POST /leadLabels

> **Operation ID:** `addLeadLabel`
> **Tags:** `LeadLabels`

## Add a lead label

Creates a lead label.

## Request Body

Content type: `application/json`

```
- **`name`** (**required**) - string
  The name of the lead label
- **`color`** (**required**) - string
  The color of the label. Only a subset of colors can be used.
  Allowed values: `blue`, `brown`, `dark-gray`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `yellow`
```

## Responses

**200** - Successful response containing payload in the `data` field

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - string
    The unique ID of the lead label
  - **`name`** (*optional*) - string
    The name of the lead label
  - **`color`** (*optional*) - string
    The color of the label. Only a subset of colors can be used.
    Allowed values: `blue`, `brown`, `dark-gray`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `yellow`
  - **`add_time`** (*optional*) - string
    The date and time of when the lead label was created. In ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
  - **`update_time`** (*optional*) - string
    The date and time of when the lead label was last updated. In ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
```


## Security

- **api_key**
- **oauth2**: leads:full