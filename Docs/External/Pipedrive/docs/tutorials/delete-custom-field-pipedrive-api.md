[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

Get the id of the custom person field

  3. 3

Check the payload of the custom field

  4. 4

Delete the custom person field

  5. 5

Full working code (PHP)

  6. 6

Full working code (Node.js)

  7. 7

Successful deletion ⛳️




###### Topics

  1. 1

Introduction

  2. 2

Get the id of the custom person field

  3. 3

Check the payload of the custom field

  4. 4

Delete the custom person field

  5. 5

Full working code (PHP)

  6. 6

Full working code (Node.js)

  7. 7

Successful deletion ⛳️




[← Back to tutorials](/tutorials)

## How to delete a custom field via Pipedrive's API

## 1\. Introduction

💡In this example, we will delete a custom person field, but you can apply this tutorial to any deal, organization or product in Pipedrive.

Here is an overview of the main steps involved, where we use PHP and the cURL library to make API requests to Pipedrive:

  1. Obtain your Pipedrive API token and company domain
  2. Identify the `id` of the custom person field that you want to delete
  3. Build the URL for the API request to delete the custom person field
  4. Use the cURL library to send a `DELETE` request to the Pipedrive API to delete the custom person field
  5. Check the response from the API to see if the custom person field was deleted successfully or not, and print a success or error message to the console accordingly



Keep in mind that deleting a custom field might permanently remove all data.

In the event you deleted a custom field by mistake, you may be able to get it back by contacting our support people.

If you still want to delete a custom field, follow the steps below.

## 2\. Get the id of the custom person field

Let's say you've got a custom person field named "Relationship status". You don't need this field anymore, so you want to delete it. First, create a file `getPersonFields.php` and follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain).

To make a `GET` request, you'll need the correct URL meant for getting person fields, for example, `https://{COMPANYDOMAIN}.pipedrive.com/api/v1/personFields?api_token=YOUR_API_TOKEN`. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/).

Here's an example of what the request itself should look like in PHP. Remember to replace the data in the example code with yours (the `$company_domain` and the `$api_token`).
    
    
    <?php
    // Content of getPersonFields.php
      
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
      
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // URL for getting Person fields
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/personFields?start=0&api_token=' . $api_token;
     
    // GET request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
       
    echo 'Sending request...' . PHP_EOL;
       
    $output = curl_exec($ch);
    curl_close($ch);
     
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to a PHP array
    $result = json_decode($output, true);
     
    // Check if data returned in the result is empty
    if (empty($result['data'])) {
        exit('Error: ' . $result['error'] . PHP_EOL);
    }
     
    // Print out full data if the result is not empty
    print_r($result['data']);

Execute the code by using the `php getPersonFields.php` command in the command line.

## 3\. Check the payload of the custom field

If the request was successful, you can now find the `id` of the custom person field named "Relationship status" from the payload.

As the original payload can be quite bulky, here's the section to look out for. From here, you'll learn that the `id` of the custom person field named "Relationship status" is **9068** :
    
    
    Array
    (
        [0] => Array
            (
                [id] => 9068
                [key] => 199fda744ce708da51ac2500dcfc2811c0032365
                [name] => Relationship status
                [order_nr] => 1
                [field_type] => enum
                [add_time] => 2018-09-17 12:15:45
                [update_time] => 2018-09-17 12:16:53
            )
    
    

## 4\. Delete the custom person field

Next, create a file `deleteCustomPersonField.php`

To make a `DELETE` request, you'll need the correct URL meant for deleting a Person field, for example, `https://{COMPANYDOMAIN}.pipedrive.com/api/v1/personFields/9068?api_token=YOUR_API_TOKEN`. If you want to use this tutorial for deleting other types of custom fields, you can find the needed URLs for that below:

**Method** | **URL** | **Useful for**  
---|---|---  
`DELETE` | [`/dealFields/{id}`](https://developers.pipedrive.com/docs/api/v1/DealFields#deleteDealField) | Deleting a custom deal field  
`DELETE` | [`/organizationFields/{id}`](https://developers.pipedrive.com/docs/api/v1/OrganizationFields#deleteOrganizationField) | Deleting a custom organization field  
`DELETE` | [`/personFields/{id}`](https://developers.pipedrive.com/docs/api/v1/PersonFields#deletePersonField) | Deleting a custom person field  
`DELETE` | [`/productFields/{id}`](https://developers.pipedrive.com/docs/api/v1/ProductFields#deleteProductField) | Deleting a custom product field  
  
As you can see from the example URL, you need to pass along the custom field's `$id` in the request URL.

## 5\. Full working code (PHP)

Here's an example of what the request should look like in PHP. Remember to replace the data in the code example for your actual `$id` of the custom Person field you want to delete, and again the `$company_domain`, and the `$api_token`.
    
    
    <?php
    // Content of deleteCustomPersonField.php
       
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
      
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
      
    // The ID of the custom Person field you want to delete
    $id = 9068;
      
    // URL for deleting a custom Person field
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/personFields/' . $id . '?api_token=' . $api_token;
     
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
        
    echo 'Sending request...' . PHP_EOL;
        
    $output = curl_exec($ch);
    curl_close($ch);
       
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to a PHP array
    $result = json_decode($output, true);
     
    // Check if data returned in the result is empty
    if (empty($result['data'])) {
        exit('Error: ' . $result['error'] . PHP_EOL);
    }
     
    // If the custom Person field was deleted successfully, print the ID of the deleted field
    if ($result['data']) {
        echo 'Success! The ID of the deleted custom Person field: ' . $result['data']['id'] . PHP_EOL;
    }
    
    

And now execute the code by using the `deleteCustomPersonField.php` command in the command line.

## 6\. Full working code (Node.js)

Here's the Node.js code as well:
    
    
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();
    
    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    
    async function deletePersonCustomField() {
        try {
            console.log('Sending request...');
    
            const api = new pipedrive.PersonFieldsApi(defaultClient);
    
            const FIELD_ID = 9073; // id of the field you want to delete
            const response = await api.deletePersonField(FIELD_ID);
    
            console.log('Custom field deleted from a person successfully!', response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Deleting custom field failed', errorToLog);
        }
    }
    
    
    deletePersonCustomField();

## 7\. Successful deletion ⛳️

In case of a successful request, this is the output you'll receive:
    
    
    Sending request...
    Success! The ID of the deleted custom Person field: 9068

You have now successfully deleted the custom person field called "Relationship status". You can also check the change from the web app.

**🔗 For more adventures:**

Make sure to check the following resources:

  * **(Postman)**[Test the API using OAuth](https://www.postman.com/pipedrive-developers)
  * **(API Reference)**[More about Person fields ](https://developers.pipedrive.com/docs/api/v1/PersonFields)



Next 


---

**Source:** https://developers.pipedrive.com/tutorials/delete-custom-field-pipedrive-api
