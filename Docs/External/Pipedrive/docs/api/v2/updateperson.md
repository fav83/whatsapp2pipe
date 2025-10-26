# PATCH /persons/{id}

> **Operation ID:** `updatePerson`
> **Tags:** `Persons`

## Update a person

Updates the properties of a person. <br>If the company uses the [Campaigns product](https://pipedrive.readme.io/docs/campaigns-in-pipedrive-api), then this endpoint will also accept and return the `marketing_status` field.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |

## Request Body

Content type: `application/json`

```
- **`name`** (*optional*) - string
  The name of the person
- **`owner_id`** (*optional*) - integer
  The ID of the user who owns the person
- **`org_id`** (*optional*) - integer
  The ID of the organization linked to the person
- **`add_time`** (*optional*) - string
  The creation date and time of the person
- **`update_time`** (*optional*) - string
  The last updated date and time of the person
- **`emails`** (*optional*) - array of object
  The emails of the person
- **`phones`** (*optional*) - array of object
  The phones of the person
- **`visible_to`** (*optional*) - integer
  The visibility of the person
- **`label_ids`** (*optional*) - array of integer
  The IDs of labels assigned to the person
- **`marketing_status`** (*optional*) - string
  If the person does not have a valid email address, then the marketing status is **not set** and `no_consent` is returned for the `marketing_status` value when the new person is created. If the change is forbidden, the status will remain unchanged for every call that tries to modify the marketing status. Please be aware that it is only allowed **once** to change the marketing status from an old status to a new one.<table><tr><th>Value</th><th>Description</th></tr><tr><td>`no_consent`</td><td>The customer has not given consent to receive any marketing communications</td></tr><tr><td>`unsubscribed`</td><td>The customers have unsubscribed from ALL marketing communications</td></tr><tr><td>`subscribed`</td><td>The customers are subscribed and are counted towards marketing caps</td></tr><tr><td>`archived`</td><td>The customers with `subscribed` status can be moved to `archived` to save consent, but they are not paid for</td></tr></table>
  Allowed values: `no_consent`, `unsubscribed`, `subscribed`, `archived`
```

## Responses

**200** - Edit person

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full