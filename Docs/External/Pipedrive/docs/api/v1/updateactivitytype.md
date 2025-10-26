# PUT /activityTypes/{id}

> **Operation ID:** `updateActivityType`
> **Tags:** `ActivityTypes`

## Update an activity type

Updates an activity type.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the activity type |

## Request Body

Content type: `application/json`

```
- **`name`** (*optional*) - string
  The name of the activity type
- **`icon_key`** (*optional*) - string
  Icon graphic to use for representing this activity type
  Allowed values: `task`, `email`, `meeting`, `deadline`, `call`, `lunch`, `calendar`, `downarrow`, `document`, `smartphone`, `camera`, `scissors`, `cogs`, `bubble`, `uparrow`, `checkbox`, `signpost`, `shuffle`, `addressbook`, `linegraph`, `picture`, `car`, `world`, `search`, `clip`, `sound`, `brush`, `key`, `padlock`, `pricetag`, `suitcase`, `finish`, `plane`, `loop`, `wifi`, `truck`, `cart`, `bulb`, `bell`, `presentation`
- **`color`** (*optional*) - string
  A designated color for the activity type in 6-character HEX format (e.g. `FFFFFF` for white, `000000` for black)
- **`order_nr`** (*optional*) - integer
  An order number for this activity type. Order numbers should be used to order the types in the activity type selections.
```

## Responses

**200** - The activity type was successfully updated

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin