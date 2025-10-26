# PUT /persons/{id}

> **Operation ID:** `updatePerson`
> **Tags:** `Persons`

## Update a person

Updates the properties of a person. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/updating-a-person" target="_blank" rel="noopener noreferrer">updating a person</a>.<br>If a company uses the [Campaigns product](https://pipedrive.readme.io/docs/campaigns-in-pipedrive-api), then this endpoint will also accept and return the `data.marketing_status` field.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |

## Request Body

Content type: `application/json`

```

```

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full