# GET /personFields

> **Operation ID:** `getPersonFields`
> **Tags:** `PersonFields`

## Get all person fields

Returns data about all person fields.<br>If a company uses the [Campaigns product](https://pipedrive.readme.io/docs/campaigns-in-pipedrive-api), then this endpoint will also return the `data.marketing_status` field.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full, admin