# DELETE /activityTypes

> **Operation ID:** `deleteActivityTypes`
> **Tags:** `ActivityTypes`

## Delete multiple activity types in bulk

Marks multiple activity types as deleted.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `ids` | string | query | Yes | The comma-separated activity type IDs |

## Responses

**200** - The activity types were successfully deleted

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin