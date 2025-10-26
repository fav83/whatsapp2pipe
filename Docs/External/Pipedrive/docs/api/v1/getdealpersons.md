# GET /deals/{id}/persons

> **Operation ID:** `getDealPersons`
> **Tags:** `Deals`

## List all persons associated with a deal

Lists all persons associated with a deal, regardless of whether the person is the primary contact of the deal, or added as a participant.<br>If a company uses the [Campaigns product](https://pipedrive.readme.io/docs/campaigns-in-pipedrive-api), then this endpoint will also return the `data.marketing_status` field. <br>This endpoint has been deprecated. Please use <a href="https://developers.pipedrive.com/docs/api/v1/Persons#getPersons" target="_blank" rel="noopener noreferrer">GET /api/v2/persons?deal_id={id}</a> instead.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full