# DELETE /persons

> **Operation ID:** `deletePersons`
> **Tags:** `Persons`

## Delete multiple persons in bulk

Marks multiple persons as deleted. After 30 days, the persons will be permanently deleted. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Persons#deletePerson" target="_blank" rel="noopener noreferrer">DELETE /api/v2/persons/{id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `ids` | string | query | Yes | The comma-separated IDs that will be deleted |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full