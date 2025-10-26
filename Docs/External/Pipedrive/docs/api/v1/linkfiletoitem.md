# POST /files/remoteLink

> **Operation ID:** `linkFileToItem`
> **Tags:** `Files`

## Link a remote file to an item

Links an existing remote file (`googledrive`) to the item you supply. For more information, see the tutorial for <a href="https://pipedrive.readme.io/docs/adding-a-remote-file" target="_blank" rel="noopener noreferrer">adding a remote file</a>.

## Request Body

Content type: `application/x-www-form-urlencoded`

```
- **`item_type`** (**required**) - string
  The item type
  Allowed values: `deal`, `organization`, `person`
- **`item_id`** (**required**) - integer
  The ID of the item to associate the file with
- **`remote_id`** (**required**) - string
  The remote item ID
- **`remote_location`** (**required**) - string
  The location type to send the file to. Only `googledrive` is supported at the moment.
  Allowed values: `googledrive`
```

## Responses

**200** - Links an existing remote file (googledrive) to the item you supply - deal, person, organization

Response type: `application/json`

```
- **`success`** (*optional*) - boolean
  If the request was successful or not
- **`data`** (*optional*) - object
  The file data
  - **`id`** (*optional*) - integer
    The ID of the file
  - **`user_id`** (*optional*) - integer
    The ID of the user to associate the file with
  - **`deal_id`** (*optional*) - integer
    The ID of the deal to associate the file with
  - **`person_id`** (*optional*) - integer
    The ID of the person to associate the file with
  - **`org_id`** (*optional*) - integer
    The ID of the organization to associate the file with
  - **`product_id`** (*optional*) - integer
    The ID of the product to associate the file with
  - **`activity_id`** (*optional*) - integer
    The ID of the activity to associate the file with
  - **`lead_id`** (*optional*) - string
    The ID of the lead to associate the file with
  - **`add_time`** (*optional*) - string
    The date and time when the file was added/created. Format: YYYY-MM-DD HH:MM:SS
  - **`update_time`** (*optional*) - string
    The last updated date and time of the file. Format: YYYY-MM-DD HH:MM:SS
  - **`file_name`** (*optional*) - string
    The original name of the file
  - **`file_size`** (*optional*) - integer
    The size of the file
  - **`active_flag`** (*optional*) - boolean
    Whether the user is active or not. false = Not activated, true = Activated
  - **`inline_flag`** (*optional*) - boolean
    Whether the file was uploaded as inline or not
  - **`remote_location`** (*optional*) - string
    The location type to send the file to. Only googledrive is supported at the moment.
  - **`remote_id`** (*optional*) - string
    The ID of the remote item
  - **`cid`** (*optional*) - string
    The ID of the inline attachment
  - **`s3_bucket`** (*optional*) - string
    The location of the cloud storage
  - **`mail_message_id`** (*optional*) - string
    The ID of the mail message to associate the file with
  - **`mail_template_id`** (*optional*) - string
    The ID of the mail template to associate the file with
  - **`deal_name`** (*optional*) - string
    The name of the deal associated with the file
  - **`person_name`** (*optional*) - string
    The name of the person associated with the file
  - **`org_name`** (*optional*) - string
    The name of the organization associated with the file
  - **`product_name`** (*optional*) - string
    The name of the product associated with the file
  - **`lead_name`** (*optional*) - string
    The name of the lead associated with the file
  - **`url`** (*optional*) - string
    The URL of the download file
  - **`name`** (*optional*) - string
    The visible name of the file
  - **`description`** (*optional*) - string
    The description of the file
```


## Security

- **api_key**
- **oauth2**: deals:full, activities:full, contacts:full