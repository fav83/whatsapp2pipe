# GET /organizations/{id}/flow

> **Operation ID:** `getOrganizationUpdates`
> **Tags:** `Organizations`

## List updates about an organization

Lists updates about an organization.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the organization |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `all_changes` | string | query | No | Whether to show custom field updates or not. 1 = Include custom field changes. If omitted, returns changes without custom field updates. |
| `items` | string | query | No | A comma-separated string for filtering out item specific updates. (Possible values - activity, plannedActivity, note, file, change, deal, follower, participant, mailMessage, mailMessageWithAttachment, invoice, activityFile, document). |

## Responses

**200** - Get the organization updates

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: recents:read