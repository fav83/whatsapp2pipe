# POST /tasks

> **Operation ID:** `addTask`
> **Tags:** `Tasks`

## Add a task

Adds a new task.

## Request Body

Content type: `application/json`

```

```

## Responses

**201** - Created task.

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
- **`data`** (*optional*) - object

- **`additional_data`** (*optional*) - object

```


## Security

- **api_key**
- **oauth2**: projects:full