# Custom fields

[ __Suggest Edits](/edit/core-api-concepts-custom-fields)

Custom fields allow you to add additional data to your Pipedrive account that isn't included by default. Each **deal** , **organization** , **person** , and **product** item can contain custom fields. We have [16 different field types](/docs/core-api-concepts-custom-fields#types-of-custom-fields) available, each with its own uses.

  


* * *

## 

Creating a custom field

[](#creating-a-custom-field)

* * *

See our [creating a new custom field](https://developers.pipedrive.com/tutorials/add-custom-field-pipedrive-api) tutorial to add a custom field programmatically.

Method| URL| Useful for  
---|---|---  
`POST`| [`/dealFields`](https://developers.pipedrive.com/docs/api/v1/DealFields#addDealField)| Adding a new deal field.  
**NB!** Leads inherit all deals’ custom fields.  
`POST`| [`/organizationFields`](https://developers.pipedrive.com/docs/api/v1/OrganizationFields#addOrganizationField)| Adding a new organization field  
`POST`| [`/personFields`](https://developers.pipedrive.com/docs/api/v1/PersonFields#addPersonField)| Adding a new person field  
`POST`| [`/productFields`](https://developers.pipedrive.com/docs/api/v1/ProductFields#addProductField)| Adding a new product field  
  
> ## 📘
> 
> Note that custom fields cannot be duplicated to multiple different Pipedrive accounts. You can add the custom fields with the same name and field type to different accounts but they'll have different values for `key` parameters referenced in our API.

  


* * *

## 

Naming a custom field

[](#naming-a-custom-field)

* * *

All custom fields are referenced as randomly generated 40-character hashes in the dataset, for example, `dcf558aac1ae4e8c4f849ba5e668430d8df9be12` \- it may look like our office cat walked across the laptop, but this actually is a key for a custom field in our API dataset.

> ## 🚧
> 
> These 40-character custom fields (for example, `dcf558aac1ae4e8c4f849ba5e668430d8df9be12`) are not shown in our API Reference as they **differ for each Pipedrive account** , but they can be seen in the API requests and responses as well as used in the requests when adding new items or updating existing ones.

You can’t rename the reference of the custom field (the field API key), but you can rename the `name` of a custom field that’s visible to the User.

Inside Pipedrive, you can find the API key of a field by going to _Settings > Data fields_ and choosing the entity (deal/person/organization/product). When you hover over the row of a custom field, a three-dot menu appears on the right-hand side. From there, choose _Copy API key_.

![Finding the API key of a custom field](https://files.readme.io/2c7026f-Pipedrive_developer_documentation_-_finding_the_API_key_of_a_custom_field.png)

Finding the API key of a custom field

  


* * *

## 

Referencing a custom field

[](#referencing-a-custom-field)

* * *

Here’s how you use an example key for a custom field in an example `POST` request to `/deals` (make sure you replace the example key with yours before making the request):

PHP
    
    
    <?php
    $api_token = 'Your API token goes here';
     
    $deal = array (
        'title' => 'New deal with a custom field',
        'value' => '500',
        'currency' => 'USD',
        'dcf558aac1ae4e8c4f849ba5e668430d8df9be12' => 'A new field value for an existing example custom field key'
    );
     
    $url = 'https://companydomain.pipedrive.com/api/v1/deals';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $deal);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['x-api-token: ' . $api_token]);
    
    $output = curl_exec($ch);
    curl_close($ch);
     
    $result = json_decode($output, true); // Check if an ID came back, if did print it out
     
    if (!empty($result['data']['id'])) { echo 'Deal was added successfully!' . PHP_EOL; }
    

Each custom field type corresponds to a specific data format. To determine in which format you need to submit data into a custom field, make a `GET` request for the same kind of object and check the format of the value of that field. You can find the list of `field_type` in [the table](/docs/core-api-concepts-custom-fields#types-of-custom-fields) below.

  


* * *

## 

Updating a custom field

[](#updating-a-custom-field)

* * *

See our [updating custom fields’ values](https://developers.pipedrive.com/tutorials/update-custom-field-pipedrive-api) tutorial to update a custom field programmatically.

Method| URL| Useful for  
---|---|---  
`PUT`| [`/dealFields/{id}`](https://developers.pipedrive.com/docs/api/v1/DealFields#updateDealField)| Updating a Deal field.  
**NB!** Leads inherit all deal's custom fields.  
`PUT`| [`/organizationFields/{id}`](https://developers.pipedrive.com/docs/api/v1/OrganizationFields#updateOrganizationField)| Updating an organization field  
`PUT`| [`/personFields/{id}`](https://developers.pipedrive.com/docs/api/v1/PersonFields#updatePersonField)| Updating a person field  
`PUT`| [`/productFields/{id}`](https://developers.pipedrive.com/docs/api/v1/ProductFields#updateProductField)| Updating a product field  
  
  


* * *

## 

Deleting a custom field

[](#deleting-a-custom-field)

* * *

> ## 🚧
> 
> We don't recommend deleting a custom field, because it might permanently remove all data. In case you do delete by mistake, there's a chance that you can get it back by [contacting](https://support.pipedrive.com/en/contact-us) our awesome support people.

See our [deleting a custom field](https://developers.pipedrive.com/tutorials/delete-custom-field-pipedrive-api) tutorial to delete a custom field programmatically.

Method| URL| Useful for  
---|---|---  
`DELETE`| [`/dealFields/{id}`](https://developers.pipedrive.com/docs/api/v1/DealFields#deleteDealField)| Marking a deal field as deleted.  
**NB!** Leads inherit all deals' custom fields.  
`DELETE`| [`/organizationFields/{id}`](https://developers.pipedrive.com/docs/api/v1/OrganizationFields#deleteOrganizationField)| Marking an organization field as deleted  
`DELETE`| [`/personFields/{id}`](https://developers.pipedrive.com/docs/api/v1/PersonFields#deletePersonField)| Marking a person field as deleted  
`DELETE`| [`/productFields/{id}`](https://developers.pipedrive.com/docs/api/v1/ProductFields#deleteProductField)| Marking a product field as deleted  
  
After a custom field is deleted, it will no longer appear in API responses. All `POST` requests mentioning a custom field will ignore it.

  


* * *

## 

Types of custom fields

[](#types-of-custom-fields)

* * *

See below the 16 different types of custom fields available:

Type| field_type| Description| Useful for| Additional info  
---|---|---|---|---  
**Text** | `varchar`| The text field is used to store texts up to 255 characters| Billing addresses, (short) comments, email addresses|   
**Autocomplete** | `varchar_auto`| The text field is used to store texts up to 255 characters and can autocomplete from the text previously inserted into this field| Custom options (e.g., tagging), email addresses|   
**Large text**| `text`| The large text field is used to store texts longer than usual| Comments, descriptions|   
**Numerical** | `double`| The numeric field is used to store data such as the amount of commission or other custom numerical data| Commission, priority level| The value should be numeric with a maximum precision (decimal places) of 16.  
  
If a number exceeds the maximum precision, it will stay without the full precision.  
**Monetary** | `monetary`| The monetary field is used to store data such as the amount of commission| Commission, amounts| The currency of the field will match the user’s default currency setting unless specified otherwise in the request.  
  
The format of the field is determined by the user’s locale.  
**Multiple options** | `set`| The multiple options field lets you predefine a list of values to choose from.  
  
Multiple option fields can have a max of 10,000 options per field.| Industry type, competitors, region|   
**Single option** | `enum`| The single option field lets you predefine a list of values out of which one can be selected.  
  
Single option fields can have a max of 10,000 options per field.| Lead type, category, industry|   
**User** | `user`| The user field can contain one user amongst users of your Pipedrive account*| Tech contacts, previous deal owners|   
**Organization** | `org`| The organization field can contain one organization out of all the organizations stored on your Pipedrive account*| Related parties, partner organizations|   
**Person** | `people`| The person field can contain one person out of all the people stored on your Pipedrive account*| Related parties, tech contacts|   
**Phone** | `phone`| A phone number field can contain a phone number (naturally) or a Skype Name with a click-to-call functionality| Skype names, phone numbers| No auto-formatting unless enabled from the User Interface (supports only the US phone format)  
**Time** | `time`| The time field is used to store times, picked from a handy inline time picker| Delivery times, lunchtime|   
**Time range** | `timerange`| The time range field is used to store time ranges picked from a handy inline time picker| Office hours, the best time to contact|   
**Date** | `date`| Date field is used to store dates picked from a handy inline calendar| Delivery dates, deadlines| The format of the field is determined by the user’s locale  
**Date range** | `daterange`| The date range field is used to store date ranges picked from a handy inline calendar| Event dates, completion estimates|   
**Address** | `address`| Address field is used to store addresses| Event places, office locations (when separate from business address)| The address field can hold all parts of address components – including City, tate, Zip Code, and Country – so there’s no need to create separate address fields for each address component.  
  
You can use Google Maps autocomplete textfield to enter addresses and visualize them on a map. You’ll also be able to filter items based on specific address criteria.  
  
*_Doesn’t link the item with the user, person, or organization for statistics or any other form of ownership or relation, but can be used for filtering._

  


* * *

## 

How to find out if a field is a custom field

[](#how-to-find-out-if-a-field-is-a-custom-field)

* * *

The `edit_flag` parameter in the response body of an entity’s fields can be used to identify if the field is a custom field:

  * `true` – a custom field
  * `false` – Pipedrive default field



JSON
    
    
    {
      id: 12499,
      key: '123456789',
      name: 'Date',
      order_nr: 47,
      field_type: 'date',
      json_column_flag: true,
      add_time: '2023-03-02 02:14:54',
      update_time: '2023-03-02 02:14:54',
      last_updated_by_user_id: 13053568,
      edit_flag: true,
      details_visible_flag: true,
      add_visible_flag: false,
      important_flag: true,
      bulk_edit_allowed: true,
      filtering_allowed: true,
      sortable_flag: true,
      mandatory_flag: false,
      active_flag: true,
      projects_detail_visible_flag: false,
      index_visible_flag: true,
      searchable_flag: false
    },
    

  


* * *

## 

Custom fields created by Contact Sync

[](#custom-fields-created-by-contact-sync)

* * *

When a user first sets up Contact Sync, five new custom fields (Instant messenger, Postal address, Notes, Birthday, Job title) are created for the entire company. These fields are similar to the default Pipedrive fields as they have a field API key that follows the syntax of all default Pipedrive API keys (field name, with an underscore replacing each space), unlike [user-generated custom fields](/docs/core-api-concepts-custom-fields#naming-a-custom-field). 

Here are the five custom fields created by Contact Sync:

Field name| Type| Show in Add new dialog| Show in detail view| Field API key| Additional info  
---|---|---|---|---|---  
Instant messenger| Varchar|  _by default:_ No|  _by default:_ No| `im`| Although this is a text field, it accepts an array of objects. ([See example below](/docs/core-api-concepts-custom-fields#instant-messenger-field-and-labels))  
Postal address| Address|  _by default:_ No|  _by default:_ No| `postal_address`|   
Notes| Large Text|  _by default:_ No|  _by default:_ No| `notes`|   
Birthday| Date|  _by default:_ No|  _by default:_ No| `birthday`|   
Job title| Text|  _by default:_ No|  _by default:_ No| `job_title`|   
  
You can also see these fields in the Pipedrive web app by going to _Settings > (Company) > Data fields > Person_. It’s not possible to add any other fields to Contact Sync.

#### 

Contact Sync and custom fields duplication

[](#contact-sync-and-custom-fields-duplication)

Contact Sync directly affects these five fields, as the data for these fields is updated every time the Contact Sync source is updated. As such, when using these fields, please note that they may be duplicated by users who create custom fields with the same name. This can cause issues where the field names match, but the API keys do not because one has a Pipedrive API key and the other has a [40-character hashed API key](/docs/core-api-concepts-custom-fields#naming-a-custom-field). Therefore, a user may have two fields with different information in them.

#### 

Instant messenger field and labels

[](#instant-messenger-field-and-labels)

The instant messenger field (field key `im`) is a text field that accepts an array of objects. Do note that multiple `labels `are available for the different instant messengers, for example, `Google`, `AIM`, `Yahoo`, `Skype`, etc.

Here is an example of what an array for this field could look like:

JSON
    
    
    [
      {
        "label": "google",
        "value": "[[email protected]](/cdn-cgi/l/email-protection)",
        "primary": true
      },
      {
        "label": "aim",
        "value": "[[email protected]](/cdn-cgi/l/email-protection)",
        "primary": false
      }
    ]
    

__Updated 7 months ago

* * *

Read next

  * [Adding a new Custom Field](https://developers.pipedrive.com/tutorials/add-custom-field-pipedrive-api)
  * [Updating Custom Fields' Values](https://developers.pipedrive.com/tutorials/update-custom-field-pipedrive-api)
  * [Deleting a Custom Field](https://developers.pipedrive.com/tutorials/delete-custom-field-pipedrive-api)


