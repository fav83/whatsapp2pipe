# PUT /persons/{id}/merge

> **Operation ID:** `mergePersons`
> **Tags:** `Persons`

## Merge two persons

Merges a person with another person. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/merging-two-persons" target="_blank" rel="noopener noreferrer">merging two persons</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |

## Request Body

Content type: `application/json`

```
- **`merge_with_id`** (**required**) - integer
  The ID of the person that will not be overwritten. This person’s data will be prioritized in case of conflict with the other person.
```

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full