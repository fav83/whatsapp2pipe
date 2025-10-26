# POST /filters

> **Operation ID:** `addFilter`
> **Tags:** `Filters`

## Add a new filter

Adds a new filter, returns the ID upon success. Note that in the conditions JSON object only one first-level condition group is supported, and it must be glued with 'AND', and only two second level condition groups are supported of which one must be glued with 'AND' and the second with 'OR'. Other combinations do not work (yet) but the syntax supports introducing them in future. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/adding-a-filter" target="_blank" rel="noopener noreferrer">adding a filter</a>.

## Request Body

Content type: `application/json`

```
- **`name`** (**required**) - string
  The name of the filter
- **`conditions`** (**required**) - object
  The conditions of the filter as a JSON object. Please note that a maximum of 16 conditions is allowed per filter and `date` values must be supplied in the `YYYY-MM-DD` format. It requires a minimum structure as follows: `{"glue":"and","conditions":[{"glue":"and","conditions": [CONDITION_OBJECTS]},{"glue":"or","conditions":[CONDITION_OBJECTS]}]}`. Replace `CONDITION_OBJECTS` with JSON objects of the following structure: `{"object":"","field_id":"", "operator":"","value":"", "extra_value":""}` or leave the array empty. Depending on the object type you should use another API endpoint to get `field_id`. There are five types of objects you can choose from: `"person"`, `"deal"`, `"organization"`, `"product"`, `"activity"` and you can use these types of operators depending on what type of a field you have: `"IS NOT NULL"`, `"IS NULL"`, `"<="`, `">="`, `"<"`, `">"`, `"!="`, `"="`, `"LIKE '$%'"`, `"LIKE '%$%'"`, `"NOT LIKE '$%'"`. To get a better understanding of how filters work try creating them directly from the Pipedrive application.

- **`type`** (**required**) - string
  The type of filter to create
```

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: deals:full, activities:full, contacts:full