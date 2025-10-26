# GET /persons/{id}

> **Operation ID:** `getPerson`
> **Tags:** `Persons`

## Get details of a person

Returns the details of a specific person. Fields `ims`, `postal_address`, `notes`, `birthday`, and `job_title` are only included if contact sync is enabled for the company.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |
| `include_fields` | string (`next_activity_id`, `last_activity_id`, `open_deals_count`, ...) | query | No | Optional comma separated string array of additional fields to include. `marketing_status` and `doi_status` can only be included if the company has marketing app enabled. |
| `custom_fields` | string | query | No | Optional comma separated string array of custom fields keys to include. If you are only interested in a particular set of custom fields, please use this parameter for faster results and smaller response.<br/>A maximum of 15 keys is allowed. |

## Responses

**200** - Get person

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:read, contacts:full