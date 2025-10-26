# GET /persons/{id}

> **Operation ID:** `getPerson`
> **Tags:** `Persons`

## Get details of a person

Returns the details of a person. Note that this also returns some additional fields which are not present when asking for all persons. Also note that custom fields appear as long hashes in the resulting data. These hashes can be mapped against the `key` value of personFields.<br>If a company uses the [Campaigns product](https://pipedrive.readme.io/docs/campaigns-in-pipedrive-api), then this endpoint will also return the `data.marketing_status` field.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full