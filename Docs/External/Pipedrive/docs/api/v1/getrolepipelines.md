# GET /roles/{id}/pipelines

> **Operation ID:** `getRolePipelines`
> **Tags:** `Roles`

## List pipeline visibility for a role

Returns the list of either visible or hidden pipeline IDs for a specific role. For more information on pipeline visibility, please refer to the <a href="https://support.pipedrive.com/en/article/visibility-groups" target="_blank" rel="noopener noreferrer">Visibility groups article</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the role |
| `visible` | boolean | query | No | Whether to return the visible or hidden pipelines for the role |

## Responses

**200** - Get either visible or hidden pipeline ids for a role

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin