# PUT /pipelines/{id}

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
- **`deal_probability`** (*optional*) - any
  Whether deal probability is disabled or enabled for this pipeline
- **`order_nr`** (*optional*) - integer
  Defines the order of pipelines. First order (`order_nr=0`) is the default pipeline.
- **`active`** (*optional*) - any
  Whether this pipeline will be made inactive (hidden) or active
```

## Responses

**200** - Edit pipeline

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin