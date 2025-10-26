# POST /pipelines

> **Operation ID:** `addPipeline`
> **Tags:** `Pipelines`

## Add a new pipeline

Adds a new pipeline.

## Request Body

Content type: `application/json`

```
- **`name`** (**required**) - string
  The name of the pipeline
- **`is_deal_probability_enabled`** (*optional*) - boolean
  Whether deal probability is disabled or enabled for this pipeline
```

## Responses

**200** - Add pipeline

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin