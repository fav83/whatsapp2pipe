# GET /leadSources

> **Operation ID:** `getLeadSources`
> **Tags:** `LeadSources`

## Get all lead sources

Returns all lead sources. Please note that the list of lead sources is fixed, it cannot be modified. All leads created through the Pipedrive API will have a lead source `API` assigned.


## Responses

**200** - The successful response containing payload in the `data` field.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of object
```


## Security

- **api_key**
- **oauth2**: leads:read, leads:full