# Documentation

[← Back to tutorials](/tutorials)

## Adding an Organization via Pipedrive API

## 1\. Introduction

Follow the next steps to add a type of contact - an Organization - using PHP with our Pipedrive API. When you have finished adding an Organization, you can continue with the tutorial of how to create a Deal.

Only want to see the finished code for adding an Organization? No problem! You can find it below. You can also try out adding an organization through our API Reference, by using the [`POST /organizations`](https://developers.pipedrive.com/docs/api/v1/Organizations#addOrganization) endpoint.

## 2\. Get your API token

Follow our tutorials on how to find the API token and how to get the company domain. Then create a file `addOrganization.php` and first give value to the `$api_token` and `$company_domain` variables:
    
    
    <?php
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';

## 3\. Prepare the data

When adding an Organization, there's only one required parameter you have to give a value to - the Organization name. You can give your new Organization [additional parameters](https://developers.pipedrive.com/docs/api/v1/Organizations#addOrganization), too. To send one or multiple parameters with your chosen values, you need to create an array of these chosen parameters:
    
    
    // Name of the new organization
    $data = array(
      'name' => 'Organization name goes here',
    );

## 4\. Define target URL

To make a request, you'll need the correct URL meant for adding Organization. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/). You must provide the API token as part of the query string for all requests at the end of the URL, an example would look like this `https://{COMPANYDOMAIN}.pipedrive.com/api/v2/organizations?api_token=YOUR_API_TOKEN`.

You need to create a `$url` variable that holds correct URL for Organization adding and add `$api_token` variable to it:
    
    
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/organizations?api_token=' . $api_token;

## 5\. Make a POST request

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a `POST` request with your data against our API.

Simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);

## 6\. Check the result

`$output` variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array.
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);

After that, you should check if the Organization ID came back as part of returned data. If it did, then this means that a new Organization was added successfully.
    
    
    // Check if an Organization ID came back, if did print it out
    if (!empty($result['data']['id'])) {
      echo 'Organization added successfully! ' . PHP_EOL;
    }

## 7\. Full working example (PHP)

Copy the full working example into `addOrganization.php`:
    
    
    <?php
    // Content of addOrganization.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // Name of the new organization
    $data = array(
      'name' => 'Organization name goes here',
    );
     
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/organizations?api_token=' . $api_token;
     
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);
     
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
     
    // Check if an Organization ID came back, if did print it out
    if (!empty($result['data']['id'])) {
      echo 'Organization added successfully! ' . PHP_EOL;
    }
    
    

## 8\. Full working example (Node.js)
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import {
      Configuration,
      OrganizationsApi,
    } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function addOrganization() {
      try {
        console.log('Sending request...');
    
        const organizationsApi = new OrganizationsApi(apiConfig);
    
        // Required field: name
        const data = {
          name: 'Org Inc test',
        };
    
        const response = await organizationsApi.addOrganization({
          AddOrganizationRequest: data,
        });
    
        console.log('Organization was added successfully!', response);
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Adding failed', errorToLog);
      }
    }
    
    addOrganization();

## 9\. Execute the code

Now run the command `php addOrganization.php` in terminal and you should see the following output:
    
    
    $ php addOrganization.php
    Sending request...
    Organization was added successfully!

Next 
