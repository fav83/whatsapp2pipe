[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

Part 1: How to update custom fields

  3. 3

Fetch only the relevant fields in the response

  4. 4

Obtaining the custom field's key

  5. 5

Update the field with a new value (PHP)

  6. 6

Update the field with a new value (Node.js)

  7. 7

⛳️ Successful update

  8. 8

Part 2: Update a single/multiple option custom product field

  9. 9

Get the key and options for the custom field

  10. 10

Fetch only the relevant fields in the response

  11. 11

Obtaining the custom field's key and options

  12. 12

Update the field with a new option (PHP)

  13. 13

Update the field with a new option (Node.js)

  14. 14

⛳️ Successful update




###### Topics

  1. 1

Introduction

  2. 2

Part 1: How to update custom fields

  3. 3

Fetch only the relevant fields in the response

  4. 4

Obtaining the custom field's key

  5. 5

Update the field with a new value (PHP)

  6. 6

Update the field with a new value (Node.js)

  7. 7

⛳️ Successful update

  8. 8

Part 2: Update a single/multiple option custom product field

  9. 9

Get the key and options for the custom field

  10. 10

Fetch only the relevant fields in the response

  11. 11

Obtaining the custom field's key and options

  12. 12

Update the field with a new option (PHP)

  13. 13

Update the field with a new option (Node.js)

  14. 14

⛳️ Successful update




[← Back to tutorials](/tutorials)

## How to update custom fields via Pipedrive's API

## 1\. Introduction

💡In this example, we will update the value of a **custom deal field**. You can adjust and apply this tutorial to the custom fields of organization, person, and product – except for single-option and multiple-option custom Product fields.  
  
If you are updating a **single-option and/or multiple-option custom Product field** , the process is slightly different. You have to pass the ``id`` of the option instead of the value. Please take a look at the section below!

Let's say you've got a custom deal field named "Appointed manager" and a deal called "Harvey Dent" in your Pipedrive account. In this deal, you want to update the value of the custom field from "Batman" to "Joker" using our API. 

In this tutorial, we'll be using PHP and the cURL library to make API requests to Pipedrive. The tutorial code will walk you through the steps involved in updating the custom deal field value. You can also find the Node.js example.

A quick overview of the steps:

  1. Obtain the Pipedrive API token and company domain
  2. Prepare the new value for the custom field you want to update
  3. Identify the specific deal that you want to update
  4. Use the cURL library to send a PUT request to the Pipedrive API to update the custom field value for the specified deal
  5. Confirm if the update was successful or not and provide an appropriate message to the user



## 2\. Part 1: How to update custom fields

First, create a file `getDealFields.php` and follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain).

To make a `GET` request, you'll need the correct URL for getting Deal fields. An example would look like this: ``https://{YOUR_COMPANY_DOMAIN}.pipedrive.com/api/v1/dealFields?start=0&api_token={YOUR_API_TOKEN}``. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/).

**Method** | **URL** | **What it's for**  
---|---|---  
GET | [/v1/dealFields](https://developers.pipedrive.com/docs/api/v1/DealFields#getDealFields) | Getting all deal fields  
GET | [/v1/organizationFields](https://developers.pipedrive.com/docs/api/v1/OrganizationFields#getOrganizationFields) | Getting all Organization fields  
GET | [/v1/personFields](https://developers.pipedrive.com/docs/api/v1/PersonFields#getPersonFields) | Getting all person fields  
GET | [/v1/productFields](https://developers.pipedrive.com/docs/api/v1/ProductFields#getProductFields) | Getting all product fields  
  
## 3\. Fetch only the relevant fields in the response

To improve the request, it would be wise to pass in [field selectors](https://pipedrive.readme.io/docs/core-api-concepts-requests#field-selector) to indicate which fields you'd like to fetch instead of getting **all** deal fields. This will make the output short and sweet, and it'll be very convenient for you to find the ``key`` (the field API key) for the custom field "Appointed manager".

An example URL with the ``key`` and ``name`` (to know which belongs to which) field selectors looks like this: ``https://{YOUR_COMPANY_DOMAIN}.pipedrive.com/api/v1/dealFields:(key,name)?start=0&api_token={YOUR_API_TOKEN}``

Here's an example of what the request should look like in PHP. Remember to replace the data in the example with yours (the ``api_token`` and the ``company_domain``).
    
    
    <?php
    // Content of getDealFields.php
      
    // Pipedrive API token
    $api_token = '<API_TOKEN>';
      
    // Pipedrive company domain
    $company_domain = 'theunicorntail';
     
    // URL for getting Deal Fields
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/dealFields:(key,name)?start=0&api_token=' . $api_token;
     
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
     
    // Check if data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Error: ' . $result['error'] . PHP_EOL);
    }
     
    // Print out full data
    print_r($result['data']);
    

Execute the code by using the `php getDealFields.php` command in the command line.

## 4\. Obtaining the custom field's key

If the request was successful, you'll learn from the output that the ``key`` (field API key) for the custom field "Appointed manager" is `dcf558aac1ae4e8c4f849ba5e668430d8df9be12`:
    
    
    {
        "success": true,
        "data": [
            {
                "key": "dcf558aac1ae4e8c4f849ba5e668430d8df9be12",
                "name": "Appointed manager"
            }
        ]
    }
    

## 5\. Update the field with a new value (PHP)

First, create a file `updateDeal.php`.

To make a `PATCH` request, you'll need the correct URL meant for updating a deal. An example with the ``deal_id`` being ``567`` would look like this: ``https://{YOUR_COMPANY_DOMAIN}.pipedrive.com/api/v2/deals/567?api_token={YOUR_API_TOKEN}``.

With the `PATCH` request, you need to pass along the ``key`` (field API key) as a parameter and add a new value. In this case, you need to change the value of the "Appointed manager" custom field from "Batman" to "Joker".

Here's an example of what the `PATCH` request should look like in PHP. Don't forget to replace the data in the example with your ``deal_id`` ([how to find the deal ID](https://pipedrive.readme.io/docs/getting-details-of-a-deal#step-2-prepare-the-data)), the ``api_token`` and the ``company_domain``.
    
    
    <?php
    // Content of updateDeal.php
       
    // Pipedrive API token
    $api_token = '<API_TOKEN>';
      
    // Pipedrive company domain
    $company_domain = 'theunicorntail';
      
    // Pass custom field API key as parameter and add the new value
    $data = array(
      'custom_fields' => array(
        'dcf558aac1ae4e8c4f849ba5e668430d8df9be12' => 'Joker'
      )
    );
      
    // The Harvey Dent Deal ID
    $deal_id = 260;
      
    // URL for updating a Deal
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/deals/' . $deal_id . '?api_token=' . $api_token;
      
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
       
    echo 'Sending request...' . PHP_EOL;
       
    $output = curl_exec($ch);
    curl_close($ch);
      
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to a PHP array
    $result = json_decode($output, true);
      
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Updating failed' . PHP_EOL);
    }
      
    // Check if the update was successful
    if (!empty($result['data']['id']))
     
    echo 'The value of the custom field was updated successfully!';
    

And now execute the code by using the php `updateDeal.php` command in the command line.

## 6\. Update the field with a new value (Node.js)

If you are using Node.js, you can use the following script:
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration as ConfigurationV1, DealFieldsApi } from 'pipedrive/v1';
    import { Configuration as ConfigurationV2, DealsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    // Please, use the v1 configuration only when endpoints are not available in v2.
    const apiConfigV1 = new ConfigurationV1({ apiKey: token });
    const apiConfigV2 = new ConfigurationV2({ apiKey: token });
     
    async function updatingCustomFieldValue() {
        try {
            console.log('Sending request...');
            
            const DEAL_ID = 158; // An ID of Deal which will be updated
            const fieldsApi = new DealFieldsApi(apiConfigV1);
            const dealsApi = new DealsApi(apiConfigV2);
    
            // Get all Deal fields (keep in mind pagination)
            const dealFields = await fieldsApi.getDealFields();
            // Find a field you would like to set a new value to on a Deal
            const appointedManagerField = dealFields.data.find(field => field.name === 'Appointed manager');
    
            const updatedDeal = await dealsApi.updateDeal({
              id: DEAL_ID,
              UpdateDealRequest: {
                custom_fields: {
                  [appointedManagerField.key]: 'Joker!'
                }
              }
            });
    
            console.log('The value of the custom field was updated successfully!', updatedDeal);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Updating failed', errorToLog);
        }
    }
    
    updatingCustomFieldValue();
    
    

## 7\. ⛳️ Successful update

Find the new value of the same ``key`` (field API key) you used as a parameter in the `PATCH` request. Check if the new value of this ``key`` is now "Joker".

The original payload is probably quite bulky (unfortunately, the field selector works only for `GET` requests), so here's the section you should look for:
    
    
    {
        "success": true,
        "data": {
            "id": 260,
            "title": "Harvey Dent",
            "add_time": "2018-09-07 12:08:09",
            "update_time": "2018-09-07 12:57:52",
            "d9841077efc3a2c43b371b72cd1d0d682dddf968": null,
            "cbe7a7df3df2590be065b39df863912c6f030007": null,
            "dcf558aac1ae4e8c4f849ba5e668430d8df9be12": "Joker",   
            }
        }
    }

And there you go, you have now updated the value within a custom Deal field named "Appointed manager" from "Batman" to "Joker" in your Deal called "Harvey Dent". You can also check the change from the web app.

## 8\. Part 2: Update a single/multiple option custom product field

To update a single option and/or multiple option custom product field, you have to pass the ``id`` of the option or an array of IDs to update multiple possible values. Read on to find out how to do this with our example tutorial.

Let's say you have a multiple option custom product field called "Vehicle add-ons" with three options: "armor", "titanium wheels" and "thrusters".

For one of your products – "Batmobile", the "armor" option has already been selected. You now want to add a second option, "titanium wheels", to the product.

## 9\. Get the key and options for the custom field

First, create a file `getProductFields.php` and follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain).

To make a `GET` request, you'll need the correct URL for getting Product fields. An example would look like this ``https://{YOUR_COMPANY_DOMAIN}.pipedrive.com/api/v1/productFields?start=0&api_token={YOUR_API_TOKEN}``. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/).

**Method** | **URL** | **What it's for**  
---|---|---  
GET | [/v1/productFields](https://developers.pipedrive.com/docs/api/v1/ProductFields#getProductFields) | Getting all Product fields  
  
## 10\. Fetch only the relevant fields in the response

To obtain a short and sweet output, the fields you want to pass are ``key``, ``name`` and ``options``. An example URL with these fields would look like this: ``https://{YOUR_COMPANY_DOMAIN}.pipedrive.com/api/v1/productFields:(key,name,options)?start=0&api_token={YOUR_API_TOKEN}``.

Here's an example of what the request should look like in PHP. Don't forget to replace the data in the example with yours (the ``api_token`` and the ``company_domain``):
    
    
    <?php
    // Content of getProductFields.php
      
    // Pipedrive API token
    $api_token = '{YOUR_API_TOKEN}';
      
    // Pipedrive company domain
    $company_domain = '{YOUR_COMPANY_DOMAIN}';
     
    // URL for getting Deal Fields
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/productFields:(key,name,options)?start=0&api_token=' . $api_token;
     
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
     
    // Check if data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Error: ' . $result['error'] . PHP_EOL);
    }
     
    // Print out full data
    print_r($result['data']);

## 11\. Obtaining the custom field's key and options

If the request was successful, you'll learn from the output that the ``key`` (field API key) for the custom field "Vehicle add-ons" is ``576da0ff55f3635ae48bfe1416854dfc2d3c692a``. You will then see the ``options`` for your multiple option custom field with their relevant ``label`` and ``id``:
    
    
    {
        "success": true,
        "data": [
            {
                "key": "576da0ff55f3635ae48bfe1416854dfc2d3c692a",
                "name": "Vehicle add-ons",
                "options": [
                    {
                        "label": "armor",
                        "id": 11
                    },
                    {
                        "label": "titanium wheels",
                        "id": 12
                    },
                    {
                        "label": "thrusters",
                        "id": 13
                    }
                ]
            }
        ]
    }

## 12\. Update the field with a new option (PHP)

First, create a file ``updateProduct.php``.

To make a `PATCH` request, you'll need the correct URL for updating a Product field. An example with the ``product_id`` being ``789`` would look like this: 

``https://{YOUR_COMPANY_DOMAIN}.pipedrive.com/api/v2/products/789?api_token={YOUR_API_TOKEN}``.

With the `PATCH` request, you must pass along the ``key`` (field API key) as a body parameter and add the relevant ``options`` as an array of IDs.

Here's an example of what the request should look like in PHP. Remember to replace the data in the example with yours (the ``api_token`` and the ``company_domain``).
    
    
    <?php
    // Content of updateProduct.php
       
    // Pipedrive API token
    $api_token = '{YOUR_API_TOKEN}';
      
    // Pipedrive company domain
    $company_domain = '{YOUR_COMPANY_DOMAIN}';
      
    // Pass the multiple option field's key as a parameter and add the new values as an array
    $data = array(
      'custom_fields' => array(
        '576da0ff55f3635ae48bfe1416854dfc2d3c692a' => [11,12]
      )
    );
      
    // The Batmobile Product ID
    $product_id = 789;
      
    // URL for updating a Product
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/products/' . $product_id . '?api_token=' . $api_token;
      
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
       
    echo 'Sending request...' . PHP_EOL;
       
    $output = curl_exec($ch);
    curl_close($ch);
      
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to a PHP array
    $result = json_decode($output, true);
      
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Updating failed' . PHP_EOL);
    }
      
    // Check if the update was successful
    if (!empty($result['data']['id']))
     
    echo 'The value of the multiple option custom field was updated successfully!';
    

And now execute the code by using the php `updateProduct.php` command in the command line.

## 13\. Update the field with a new option (Node.js)

If you are using Node.js, you can use the following script:
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration as ConfigurationV1, ProductFieldsApi } from 'pipedrive/v1';
    import { Configuration as ConfigurationV2, ProductsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    // Please, use the v1 configuration only when endpoints are not available in v2.
    const apiConfigV1 = new ConfigurationV1({ apiKey: token });
    const apiConfigV2 = new ConfigurationV2({ apiKey: token });
     
    async function updatingCustomFieldValue() {
        try {
            console.log('Sending request...');
            
            const PRODUCT_ID = 789; // The ID of the Product which will be updated
            const fieldsApi = new ProductFieldsApi(apiConfigV1);
            const productsApi = new ProductsApi(apiConfigV2);
    
            // Get all Product fields (keep in mind pagination)
            const productFields = await fieldsApi.getProductFields();
            // Find the field you would like to set new values to on a Product
            const vehicleAddOnsField = productFields.data.find(field => field.name === 'Vehicle add-ons');
    
            const updatedProduct = await productsApi.updateProduct({
              id: PRODUCT_ID,
              UpdateProductRequest: {
                custom_fields: {
                  [vehicleAddOnsField.key]: [11, 12],
                }
              }
            });
    
            console.log('The value of the custom field was updated successfully!', updatedProduct);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Updating failed', errorToLog);
        }
    }
    
    updatingCustomFieldValue();

## 14\. ⛳️ Successful update

Check if the new value of this ``key`` now includes the IDs of both options that you wanted: ``11`` for ``armor`` and ``12`` for ``titanium wheels``.

The original payload is probably quite bulky (unfortunately, the field selector works only for `GET` requests), so here's the section you should look for:
    
    
    {
        "success": true,
        "data": {
            "id": 789,
            "name": "Batmobile",
            "576da0ff55f3635ae48bfe1416854dfc2d3c692a": "11,12",
        }
    }

**🔗 For more adventures:**

Make sure to check the following resources:

  * **(Postman)**[Test the API using OAuth](https://www.postman.com/pipedrive-developers)
  * **(API Reference)**[DealFieldsAPI](https://developers.pipedrive.com/docs/api/v1/DealFields)



Next 


---

**Source:** https://developers.pipedrive.com/tutorials/update-custom-field-pipedrive-api
