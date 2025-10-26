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
- **`deal_probability`** (*optional*) - any
  Whether deal probability is disabled or enabled for this pipeline
- **`order_nr`** (*optional*) - integer
  Defines the order of pipelines. First order (`order_nr=0`) is the default pipeline.
- **`active`** (*optional*) - any
  Whether this pipeline will be made inactive (hidden) or active
```

## Responses

**200** - Add pipeline

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin