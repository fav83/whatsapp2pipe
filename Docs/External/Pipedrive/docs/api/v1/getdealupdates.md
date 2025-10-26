# GET /deals/{id}/flow

> **Operation ID:** `getDealUpdates`
> **Tags:** `Deals`

## List updates about a deal

Lists updates about a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `all_changes` | string | query | No | Whether to show custom field updates or not. 1 = Include custom field changes. If omitted returns changes without custom field updates. |
| `items` | string | query | No | A comma-separated string for filtering out item specific updates. (Possible values - call, activity, plannedActivity, change, note, deal, file, dealChange, personChange, organizationChange, follower, dealFollower, personFollower, organizationFollower, participant, comment, mailMessage, mailMessageWithAttachment, invoice, document, marketing_campaign_stat, marketing_status_change). |

## Responses

**200** - Get the deal updates

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: recents:read