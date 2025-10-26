# POST /roles/{id}/settings

> **Operation ID:** `addOrUpdateRoleSetting`
> **Tags:** `Roles`

## Add or update role setting

Adds or updates the visibility setting for a role.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the role |

## Request Body

Content type: `application/json`

```
- **`setting_key`** (**required**) - string
  Allowed values: `deal_default_visibility`, `lead_default_visibility`, `org_default_visibility`, `person_default_visibility`, `product_default_visibility`
- **`value`** (**required**) - integer
  Possible values for the `default_visibility` setting depending on the subscription plan:<br> <table class='role-setting'> <caption><b>Light / Growth and Professional plans</b></caption> <tr><th><b>Value</b></th><th><b>Description</b></th></tr> <tr><td>`1`</td><td>Owner & Followers</td></tr> <tr><td>`3`</td><td>Entire company</td></tr> </table> <br> <table class='role-setting'> <caption><b>Premium / Ultimate plan</b></caption> <tr><th><b>Value</b></th><th><b>Description</b></th></tr> <tr><td>`1`</td><td>Owner only</td></tr> <tr><td>`3`</td><td>Owner&#39;s visibility group</td></tr> <tr><td>`5`</td><td>Owner&#39;s visibility group and sub-groups</td></tr> <tr><td>`7`</td><td>Entire company</td></tr> </table> <br> Read more about visibility groups <a href='https://support.pipedrive.com/en/article/visibility-groups'>here</a>.
  Allowed values: `1`, `3`, `5`, `7`
```

## Responses

**200** - List role settings

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: admin