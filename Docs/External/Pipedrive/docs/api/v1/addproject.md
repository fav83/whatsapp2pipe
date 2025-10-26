# POST /projects

> **Operation ID:** `addProject`
> **Tags:** `Projects`

## Add a project

Adds a new project. Note that you can supply additional custom fields along with the request that are not described here. These custom fields are different for each Pipedrive account and can be recognized by long hashes as keys.

## Request Body

Content type: `application/json`

```

```

## Responses

**201** - Created project.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - any
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:full