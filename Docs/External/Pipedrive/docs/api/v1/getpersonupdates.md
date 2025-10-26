# GET /persons/{id}/flow

> **Operation ID:** `getPersonUpdates`
> **Tags:** `Persons`

## List updates about a person

Lists updates about a person.<br>If a company uses the [Campaigns product](https://pipedrive.readme.io/docs/campaigns-in-pipedrive-api), then this endpoint's response will also include updates for the `marketing_status` field.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |
| `start` | integer | query | No | Pagination start |
| `limit` | integer | query | No | Items shown per page |
| `all_changes` | string | query | No | Whether to show custom field updates or not. 1 = Include custom field changes. If omitted returns changes without custom field updates. |
| `items` | string | query | No | A comma-separated string for filtering out item specific updates. (Possible values - call, activity, plannedActivity, change, note, deal, file, dealChange, personChange, organizationChange, follower, dealFollower, personFollower, organizationFollower, participant, comment, mailMessage, mailMessageWithAttachment, invoice, document, marketing_campaign_stat, marketing_status_change). |

## Responses

**200** - Get the person updates

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: recents:read