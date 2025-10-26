# PATCH /pipelines/{id}

> **Operation ID:** `updatePipeline`
> **Tags:** `Pipelines`

## Update a pipeline

Updates the properties of a pipeline.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the pipeline |

## Request Body

Content type: `application/json`

```
- **`name`** (*optional*) - string
  The name of the pipeline
- **`is_deal_probability_enabled`** (*optional*) - boolean
  Whether deal probability is disabled or enabled for this pipeline
```

## Responses

**200** - Edit pipeline

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin