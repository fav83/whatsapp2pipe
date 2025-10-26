# GET /leadLabels

> **Operation ID:** `getLeadLabels`
> **Tags:** `LeadLabels`

## Get all lead labels

Returns details of all lead labels. This endpoint does not support pagination and all labels are always returned.

## Responses

**200** - Successful response containing payload in the `data` field

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of object
```


## Security

- **api_key**
- **oauth2**: leads:read, leads:full