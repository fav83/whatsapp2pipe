# PUT /roles/{id}/pipelines

> **Operation ID:** `updateRolePipelines`
> **Tags:** `Roles`

## Update pipeline visibility for a role

Updates the specified pipelines to be visible and/or hidden for a specific role. For more information on pipeline visibility, please refer to the <a href="https://support.pipedrive.com/en/article/visibility-groups" target="_blank" rel="noopener noreferrer">Visibility groups article</a>.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the role |

## Request Body

Content type: `application/json`

```
- **`visible_pipeline_ids`** (**required**) - object
  The pipeline IDs to make the pipelines visible (add) and/or hidden (remove) for the specified role. It requires the following JSON structure: `{ "add": "[1]", "remove": "[3, 4]" }`.

```

## Responses

**200** - Update pipeline visibility for a role

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin