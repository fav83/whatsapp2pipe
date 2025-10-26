# POST /persons

> **Operation ID:** `addPerson`
> **Tags:** `Persons`

## Add a person

Adds a new person. Note that you can supply additional custom fields along with the request that are not described here. These custom fields are different for each Pipedrive account and can be recognized by long hashes as keys. To determine which custom fields exists, fetch the personFields and look for `key` values.<br>If a company uses the [Campaigns product](https://pipedrive.readme.io/docs/campaigns-in-pipedrive-api), then this endpoint will also accept and return the `data.marketing_status` field.

## Request Body

Content type: `application/json`

```

```

## Responses

**201** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full