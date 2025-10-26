# GET /projects

> **Operation ID:** `getProjects`
> **Tags:** `Projects`

## Get all projects

Returns all projects. This is a cursor-paginated endpoint. For more information, please refer to our documentation on <a href="https://pipedrive.readme.io/docs/core-api-concepts-pagination" target="_blank" rel="noopener noreferrer">pagination</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. |
| `filter_id` | integer | query | No | The ID of the filter to use |
| `status` | string | query | No | If supplied, includes only projects with the specified statuses. Possible values are `open`, `completed`, `canceled` and `deleted`. By default `deleted` projects are not returned. |
| `phase_id` | integer | query | No | If supplied, only projects in specified phase are returned |
| `include_archived` | boolean | query | No | If supplied with `true` then archived projects are also included in the response. By default only not archived projects are returned. |

## Responses

**200** - A list of projects.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of any
- **`additional_data`** (*optional*) - object
  The additional data of the list
  - **`next_cursor`** (*optional*) - string
    The first item on the next page. The value of the `next_cursor` field will be `null` if you have reached the end of the dataset and there’s no more pages to be returned.
```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full