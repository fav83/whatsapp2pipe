[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

Prerequisites: credentials and company domain

  3. 3

Required parameters to create the field

  4. 4

Define the target endpoint

  5. 5

Make a POST request

  6. 6

Check the result

  7. 7

Full working example (PHP)

  8. 8

Full working example (Node.js)

  9. 9

Run the code




###### Topics

  1. 1

Introduction

  2. 2

Prerequisites: credentials and company domain

  3. 3

Required parameters to create the field

  4. 4

Define the target endpoint

  5. 5

Make a POST request

  6. 6

Check the result

  7. 7

Full working example (PHP)

  8. 8

Full working example (Node.js)

  9. 9

Run the code




[← Back to tutorials](/tutorials)

## How to add a custom field via Pipedrive's API

## 1\. Introduction

Custom fields give you the opportunity to add out-of-the-box data to your Pipedrive account that isn't included by default. Each **deal** , **organization** , **person** , and **product** item can contain custom fields. We have 16 different field types available, each with their own uses, you can check them out [here](https://pipedrive.readme.io/docs/core-api-concepts-custom-fields#types-of-custom-fields).

Follow the next steps to add a new custom field.

💡In this example, we will add a new custom deal field, but you can apply this tutorial to any of the above-mentioned entities in Pipedrive.

If you only want to see the finished code (**PHP** and **Node.js**) of this example, you can find it in the last step.

## 2\. Prerequisites: credentials and company domain

Follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain). Then create a file `addNewCustomDealField.php` and give values to the `$api_token` and `$company_domain` variables:
    
    
    <?php
    // Content of addNewCustomDealField.php
       
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
       
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';

## 3\. Required parameters to create the field

In order to create a new custom field, there are two required parameters:

  * `name` \- you need to decide on what to call the new custom field (read more about [naming custom fields](https://pipedrive.readme.io/docs/core-api-concepts-custom-fields#naming-a-custom-field))
  * `field_type` \- you need to decide which [field types](https://pipedrive.readme.io/docs/core-api-concepts-custom-fields#types-of-custom-fields) you will use for the field


    
    
    // Custom field name and type of field
    $data = array(
      'name' => 'INSERT THE NAME OF THE CUSTOM FIELD...',
      'field_type' => 'INSERT THE TYPE OF THE CUSTOM FIELD...'
    );

## 4\. Define the target endpoint

Based on the entity you've decided to add a custom field to, you have to replace the endpoint in the request URL for the correct one:

**Method** | **URL** | **Useful for**  
---|---|---  
`POST` | [`/dealFields`](https://developers.pipedrive.com/docs/api/v1/DealFields#addDealField) | Adding a custom deal field  
`POST` | [`/organizationFields`](https://developers.pipedrive.com/docs/api/v1/OrganizationFields#addOrganizationField) | Adding a custom organization field  
`POST` | [`/personFields`](https://developers.pipedrive.com/docs/api/v1/PersonFields#addPersonField) | Adding a custom person field  
`POST` | [`/productFields`](https://developers.pipedrive.com/docs/api/v1/ProductFields#addProductField) | Adding a custom product field  
  
In this example, we're adding a new custom field to a deal using PHP with our API so we'll be using the [`POST /dealFields`](https://developers.pipedrive.com/docs/api/v1/DealFields#addDealField) endpoint.

An example URL for adding a custom deal field would look like this https://{COMPANYDOMAIN}.pipedrive.com/api/v1/dealFields?api_token=YOUR_API_TOKEN

You need to create a `$url` variable that holds the correct URL for adding a new custom field for your chosen item. Here's a URL for adding a new custom deal field:
    
    
    // URL for adding a new custom field
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/dealFields?api_token=' . $api_token;
    

## 5\. Make a POST request

In this step, we use cURL to send a POST request to the Pipedrive API with the custom field data.

**💡cURL** is a library that allows you to transfer data over various protocols, including HTTP, FTP, and more. In this example, cURL is being used to send an HTTP POST request to the Pipedrive API.

Here is a breakdown of what the cURL options in the code are doing:

  * `curl_init()` initializes a new cURL session and returns a cURL handle, which is used for subsequent cURL function calls
  * `curl_setopt()` sets various options for the cURL transfer. The options being set in this example are:
  * `CURLOPT_URL`: The URL to send the request to
  * `CURLOPT_RETURNTRANSFER`: If set to true, cURL will return the response instead of outputting it
  * `CURLOPT_POST`: If set to true, cURL will send a POST request
  * `CURLOPT_POSTFIELDS`: The data to send with the POST request
  * `curl_exec()` performs the cURL session and returns the response from the server
  * `curl_close()` closes the cURL session and frees up system resources.


    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
      
    echo 'Sending request...' . PHP_EOL;
      
    $output = curl_exec($ch);
    curl_close($ch);

## 6\. Check the result

The `$output` variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from the server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
    

Then you can check if data returned in the result is not empty:
    
    
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Adding failed' . PHP_EOL);
    }

After that, you should check if a newly created custom deal field `id` came back. If it did, then this means a new custom deal field was added successfully:
    
    
    // Check if a newly created custom field ID came back, if did, print out the ID and the name
    if (!empty($result['data']['id'])) {
        echo 'Custom field was added successfully!'
          . $result['data']['title'] . ' (Custom field API key: ' . $result['data']['key'] . ')' . PHP_EOL;
      }

## 7\. Full working example (PHP)

Copy the full working example into `addNewCustomDealField.php`. Remember to replace variables with your actual data:
    
    
    <?php
    // Content of addNewCustomDealField.php
       
    // Pipedrive API token
    $api_token = '<YOUR_API_TOKEN>';
       
    // Pipedrive company domain
    $company_domain = 'theunicorntail';
     
    // Custom field name and type of field
    $data = array(
        'name' => 'Random name for a custom field',
        'field_type' => 'double'
      );
     
      // URL for adding a new custom field
      $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/dealFields/?api_token=' . $api_token;
     
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
      
    echo 'Sending request...' . PHP_EOL;
      
    $output = curl_exec($ch);
    curl_close($ch);
     
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
     
    // Check if a newly created custom field ID came back, if did, print out the ID and the name
    if (!empty($result['data']['id'])) {
        echo 'Custom field was added successfully!'
          . $result['data']['title'] . ' (Custom field API key: ' . $result['data']['key'] . ')' . PHP_EOL;
      }
    

## 8\. Full working example (Node.js)

In the case of Node.js, the logic is similar to PHP.

  * We import the Pipedrive API client library and create an `ApiClient` object, setting the API key using an environment variable
  * We define a function called `addNewCustomDealField()` that sends a request to the Pipedrive API to add a new custom deal field using the SDK's `DealFieldsApi` object
  * We print a success or error message to the console depending on whether the custom deal field is added successfully or not


    
    
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();
    
    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    
    async function addNewCustomDealField() {
        try {
            console.log('Sending request...');
    
            const api = new pipedrive.DealFieldsApi(defaultClient);
    
            const response = await api.addDealField({
                name: 'Random name for a custom field',
                field_type: 'double',
            });
    
            console.log('Custom field was added successfully!', response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Adding failed', errorToLog);
        }
    }
    
    addNewCustomDealField();

## 9\. Run the code

Use the `php addNewCustomDealField.php` command to execute the code in the command line.  
Here's an example output if the custom deal field was added:
    
    
    $ php addNewCustomDealField.php
    Sending request...
    Custom field was added successfully! (Custom field API key: {key})
    

  
If adding the custom deal failed, this is the output you'll get:
    
    
    Sending request...
    Adding failed

💡You can use our [**Postman collection**](https://www.postman.com/pipedrive-developers) to test APIs using the OAuth authentication method. We recommend using OAuth for apps running in production. 

Next 


---

**Source:** https://developers.pipedrive.com/tutorials/add-custom-field-pipedrive-api
