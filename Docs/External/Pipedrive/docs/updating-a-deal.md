# Documentation

[← Back to tutorials](/tutorials)

## Updating a Deal using Pipedrive API

## 1\. Introduction

You can update different properties of an existing Deal, see the [list of parameters](https://developers.pipedrive.com/docs/api/v1/Deals#updateDeal). In this example, we're going to give a Deal a new owner by updating the owner_id of the Deal. If you only want to see the finished code of this example, you can find it below in PHP and in node.js.

## 2\. Get your API token and company domain

Follow our tutorials on [how to find the API token](how-to-find-the-api-token.md) and [how to get the company domain](how-to-get-the-company-domain.md). Then create a file updateDeal.php and first give value to the $api_token and $company_domain variables:
    
    
    <?php
    // Content of updateDeal.php
      
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
      
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';

## 3\. Prepare the data

To change the owner of an existing Deal, you'll need to know the owner_id of the new owner. You can fetch the owner_id of a User via [GET /users](https://developers.pipedrive.com/docs/api/v1/Users#getUsers) (no need to use any parameters).

You can also find the owner_id manually within the Pipedrive web app by heading to _Settings > (company) > Manage users > Users_ and clicking on the User whose ID you're interested in. Then check the last digits of the URL. An example URL would look like this https://{COMPANYDOMAIN}.pipedrive.com/users/edit/124564, which, in this case, means the owner_id would be 124564.

Insert the owner_id by giving value to the owner_id parameter:
    
    
    // New owner's User ID
    $data = array(
      'owner_id' => 0
    );

## 4\. Define Deal ID

In order to update a Deal, you'll need the deal_id. You can fetch it via [GET /deals](https://developers.pipedrive.com/docs/api/v1/Deals#getDeals) (without passing along any parameters). You can check our [getting all Deals](getting-all-deals.md) tutorial if you need help with this.

You can also find the deal_id manually by going to the Deal's detail page within the Pipedrive web app. Once you're in the Deal detail page, check the last digit(s) of the URL, this is the Deal's ID. An example URL would like this https://companydomain.pipedrive.com/deal/222 which, in this case, means the deal_id would be 222.

Insert the deal_id by giving value to the $deal_id variable:
    
    
    // Deal ID
    $deal_id = 0;

## 5\. Define target URL

To make a request, you'll need the correct URL for updating the desired Deal. An example with the deal_id being 222 would look like this https://{COMPANYDOMAIN}.pipedrive.com/api/v2/deals/222?api_token=YOUR_API_TOKEN

You need to create a $url variable that holds the correct URL for updating the Deal:
    
    
    // URL for updating a Deal
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/deals/' . $deal_id . '?api_token=' . $api_token;
    

## 6\. Make a PATCH request

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a PATCH request with your data against our API. To make the PATCH request, simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);

## 7\. Check the result

$output variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to a PHP array
    $result = json_decode($output, true);

Then you can check if data returned in the result is not empty:
    
    
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Updating failed' . PHP_EOL);
    }

And now you can check if a deal_id came back:
    
    
    // Check if the Deal ID came back, if it did, print out the User ID of the new deal owner
    
    if (!empty($result['data']['id'])) {
     echo 'Existing deal is assigned to a new owner with User ID: ' . $result['data']['owner_id']['id'] . PHP_EOL;
    }

## 8\. Full working example (PHP + Node.JS)

Copy the full working example into updateDeal.php:
    
    
    <?php
    // Content of updateDeal.php
      
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
      
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // New owner's User ID
    $data = array(
      'owner_id' => 0
    );
     
    // Deal ID
    $deal_id = 0;
     
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/deals/' . $deal_id . '?api_token=' . $api_token; 
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);
     
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to a PHP array
    $result = json_decode($output, true);
     
    // Check if the Deal ID came back, if it did, print out the User ID of the new deal owner
    if (!empty($result['data']['id'])) {
      echo 'Existing deal is assigned to a new owner, the User ID: ' . $result['data']['owner_id'] . PHP_EOL;
    } else {
      echo 'Error updating deal owner: ' . $result['error'] . PHP_EOL;
    }
    

Here's the Node.js version
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration, DealsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function updateDeal() {
      try {
        console.log('Sending request...');
    
        const dealsApi = new DealsApi(apiConfig);
    
        const DEAL_ID = 11; // id of the deal you want to update
    
        // Update deal
        const data = {
          title: 'Deal of the century - Updated V2',
          value: 20000,
          currency: 'EUR',
          person_id: null,
          org_id: null,
          stage_id: 2,
          status: 'open',
          expected_close_date: '2022-03-11',
          visible_to: 1,
        };
    
        const response = await dealsApi.updateDeal({
          id: DEAL_ID,
          UpdateDealRequest: data,
        });
    
        console.log('Deal updated successfully!', response);
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Deal update failed', errorToLog);
      }
    }
    
    updateDeal();

## 9\. To execute the code

Use php updateDeal.php command to execute the code in the command line.

Here's an example output if the Deal was assigned to a new User:
    
    
    Sending request...
    Existing deal is assigned to a new owner with User ID: 0

If updating the Deal failed, this is the output you'll get:
    
    
    Sending request...
    Updating failed

Next 
