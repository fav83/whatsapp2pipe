# DELETE /pipelines/{id}

> **Operation ID:** `deletePipeline`
> **Tags:** `Pipelines`

## Delete a pipeline

Marks a pipeline as deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the pipeline |

## Responses

**200** - Delete pipeline

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    Deleted Pipeline ID
```


## Security

- **api_key**
- **oauth2**: admin