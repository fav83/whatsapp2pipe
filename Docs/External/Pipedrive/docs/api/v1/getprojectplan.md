# GET /projects/{id}/plan

> **Operation ID:** `getProjectPlan`
> **Tags:** `Projects`

## Returns project plan

Returns information about items in a project plan. Items consists of tasks and activities and are linked to specific project phase and group.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the project |

## Responses

**200** - Get a project plan.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - array of object
- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:read, projects:full