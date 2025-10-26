# DELETE /deals/{id}/participants/{deal_participant_id}

> **Operation ID:** `deleteDealParticipant`
> **Tags:** `Deals`

## Delete a participant from a deal

Deletes a participant from a deal.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the deal |
| `deal_participant_id` | integer | path | Yes | The ID of the participant of the deal |

## Responses

**200** - Delete a participant from a deal

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  - **`id`** (*optional*) - integer
    The ID of the deal participant that was deleted
```


## Security

- **api_key**
- **oauth2**: deals:full