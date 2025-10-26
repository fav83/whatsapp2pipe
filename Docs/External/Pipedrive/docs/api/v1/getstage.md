# GET /stages/{id}

> **Operation ID:** `getStage`
> **Tags:** `Stages`

## Get one stage

Returns data about a specific stage.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the stage |

## Responses

**200** - Get stage

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  The stage object

```


## Security

- **api_key**
- **oauth2**: deals:read, deals:full, admin