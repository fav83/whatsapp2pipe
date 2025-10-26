# PUT /organizations/{id}/merge

> **Operation ID:** `mergeOrganizations`
> **Tags:** `Organizations`

## Merge two organizations

Merges an organization with another organization. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/merging-two-organizations" target="_blank" rel="noopener noreferrer">merging two organizations</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |

## Request Body

Content type: `application/json`

```
- **`merge_with_id`** (**required**) - integer
  The ID of the organization that the organization will be merged with
```

## Responses

**200** - Success

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the merged organization
```


## Security

- **api_key**
- **oauth2**: contacts:full