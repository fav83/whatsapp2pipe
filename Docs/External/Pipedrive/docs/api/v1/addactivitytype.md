# POST /activityTypes

> **Operation ID:** `addActivityType`
> **Tags:** `ActivityTypes`

## Add new activity type

Adds a new activity type.

## Request Body

Content type: `application/json`

```
- **`name`** (**required**) - string
  The name of the activity type
- **`icon_key`** (**required**) - string
  Icon graphic to use for representing this activity type
  Allowed values: `task`, `email`, `meeting`, `deadline`, `call`, `lunch`, `calendar`, `downarrow`, `document`, `smartphone`, `camera`, `scissors`, `cogs`, `bubble`, `uparrow`, `checkbox`, `signpost`, `shuffle`, `addressbook`, `linegraph`, `picture`, `car`, `world`, `search`, `clip`, `sound`, `brush`, `key`, `padlock`, `pricetag`, `suitcase`, `finish`, `plane`, `loop`, `wifi`, `truck`, `cart`, `bulb`, `bell`, `presentation`
- **`color`** (*optional*) - string
  A designated color for the activity type in 6-character HEX format (e.g. `FFFFFF` for white, `000000` for black)
```

## Responses

**200** - The activity type was successfully created

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin