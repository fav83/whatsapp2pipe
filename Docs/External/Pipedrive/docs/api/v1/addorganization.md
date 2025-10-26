# POST /organizations

> **Operation ID:** `addOrganization`
> **Tags:** `Organizations`

## Add an organization

Adds a new organization. Note that you can supply additional custom fields along with the request that are not described here. These custom fields are different for each Pipedrive account and can be recognized by long hashes as keys. To determine which custom fields exists, fetch the organizationFields and look for `key` values. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/adding-an-organization" target="_blank" rel="noopener noreferrer">adding an organization</a>.

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