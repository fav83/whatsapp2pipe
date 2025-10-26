# GET /permissionSets

> **Operation ID:** `getPermissionSets`
> **Tags:** `PermissionSets`

## Get all permission sets

Returns data about all permission sets.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `app` | string (`sales`, `projects`, `campaigns`, ...) | query | No | The app to filter the permission sets by |

## Responses

**200** - Get all permissions

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin