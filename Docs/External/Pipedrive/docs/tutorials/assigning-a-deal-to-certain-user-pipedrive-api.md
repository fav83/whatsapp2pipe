[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

Method 1 - Create a new deal

  3. 3

Prepare the data

  4. 4

Define target URL

  5. 5

Make a POST request

  6. 6

Check the result

  7. 7

Full working example of Method 1

  8. 8

⛳️ Execute the code

  9. 9

Method 2 - Update an existing deal

  10. 10

Define Deal ID

  11. 11

Define target URL

  12. 12

Make a PUT request

  13. 13

Check the result

  14. 14

Full working example (Method 2)

  15. 15

⛳️ Execute the code




###### Topics

  1. 1

Introduction

  2. 2

Method 1 - Create a new deal

  3. 3

Prepare the data

  4. 4

Define target URL

  5. 5

Make a POST request

  6. 6

Check the result

  7. 7

Full working example of Method 1

  8. 8

⛳️ Execute the code

  9. 9

Method 2 - Update an existing deal

  10. 10

Define Deal ID

  11. 11

Define target URL

  12. 12

Make a PUT request

  13. 13

Check the result

  14. 14

Full working example (Method 2)

  15. 15

⛳️ Execute the code




[← Back to tutorials](/tutorials)

## Assigning a Deal to a certain User using Pipedrive API

## 1\. Introduction

In this tutorial, we'll explain to you the two primary methods of how to assign a Deal to a certain User:

  * Method 1 - Create a new deal
  * Method 2 - Update an existing deal



Only want to see the finished code? No problem! You can find it below for Method 1 and Method 2.

The owner is identified by the Owner ID of the Deal object, so if you want to assign a specific owner to a specific Deal then you need to assign the correct Owner ID to the user_id parameter.

There are two possible ways for that: you can either create a new Deal providing the correct value for the user_id or you can update the existing user_id value of a specific Deal. Follow the next steps using PHP with our API.

## 2\. Method 1 - Create a new deal

Follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain). Then create a file and first give value to the $api_token and $company_domain variables:
    
    
    <?php
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';

## 3\. Prepare the data

You can fetch the owner_id of the certain Owner via [GET /users](https://developers.pipedrive.com/docs/api/v1/Users#getUsers) (no need to use any parameters).

There are two required parameters you have to give a value to - the Deal title and the Owner ID:
    
    
    // Now you first insert your deal title and then the OwnerID
    $deal = array(
      'title' => 'Your deal title goes here',
      'owner_id' => 'The OwnerID goes here'
    );

## 4\. Define target URL

To make a request, you'll need the correct URL meant for creating Deals. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/). You must provide the API token as part of the query string for all requests at the end of the URL. An example would look like this https://{COMPANYDOMAIN}.pipedrive.com/api/v2/deals?api_token=YOUR_API_TOKEN

You need to create a $url variable which holds the correct URL for Deal creation and add $api_token variable to it:
    
    
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/deals?api_token=' . $api_token;

## 5\. Make a POST request

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a POST request with your data against our API.

Simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($deal));
     
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);

## 6\. Check the result

$output variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);

After that, you should check if the ID came back as part of returned data. If it did, then this means that a new Deal was added successfully.
    
    
    // Check if a Deal ID came back, if did print out Owner ID of the new deal owner
    if (!empty($result['data']['id'])) {
        echo 'New deal added for Owner ' . $result['data']['owner_id'] . PHP_EOL;
    }
    

## 7\. Full working example of Method 1

Copy the full working example into createDeal.php:
    
    
    <?php
    // Content of createDeal.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // Now you first insert your deal title and then the Owner ID
    $deal = array(
      'title' => 'Your deal title goes here',
      'owner_id' => 'The Owner ID goes here'
    );
    
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/deals?api_token=' . $api_token;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($deal));
    
    echo 'Sending request...' . PHP_EOL;
    
    $output = curl_exec($ch);
    curl_close($ch);
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
    
    // Check if an Deal ID came back, if did print out Owner ID of the new deal owner
    if (!empty($result['data']['id'])) {
        echo 'New deal added for Owner ' . $result['data']['owner_id'] . PHP_EOL;
    }
    

## 8\. ⛳️ Execute the code

Now run the command php createDeal.php in terminal and you should see the following output:
    
    
    $ php createDeal.php
    Sending request...
    New deal added for Owner [owner_id]

## 9\. Method 2 - Update an existing deal

Repeat Step 1 from Method 1.

You can fetch the user_id of the certain Owner via [GET /users](https://developers.pipedrive.com/docs/api/v1/Users#getUsers) (no need to use any parameters).

Insert the Owner ID by giving value to the user_id parameter:
    
    
    <?php
    // New owner's Owner ID
    $data = array(
      'owner_id' => 'New owner Owner ID goes here'
    );

## 10\. Define Deal ID

In order to update a Deal, you'll need the deal_id. You can fetch it via [GET /deals](https://developers.pipedrive.com/docs/api/v1/Deals#getDeals) (no need to use any parameters).

You can also click on the Deal and look at the end of the URL for the deal_id.
    
    
    // Deal ID
    $deal_id = 'Your Deal ID goes here';

## 11\. Define target URL

To make a request, you'll need the correct URL meant for updating Deals. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/). You must provide the API token as part of the query string for all requests to the end URL would look like this https://{COMPANYDOMAIN}.pipedrive.com/api/v2/deals/131?api_token=YOUR_API_TOKEN

You need to create a $url variable that holds the correct URL for deal updating, adding $deal_id and $api_token variables to it:
    
    
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/deals/' . $deal_id . '?api_token=' . $api_token;

## 12\. Make a PUT request

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a PUT request with your data against our API.

To make the PUT request, simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);

## 13\. Check the result

$output variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array.
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
    

Now you can check if a Deal ID came back:
    
    
    // Check if a Deal ID came back, if did print out Owner ID of the new deal owner
    if (!empty($result['data']['id'])) {
     echo 'Existing deal is assigned to a new owner, the Owner ID:' . $result['data']['user_id'] . PHP_EOL;
    }

## 14\. Full working example (Method 2)

Copy the full working example into updateDealOwner.php:
    
    
    <?php
    // Content of updateDealOwner.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // New owner's Owner ID
    $data = array(
      'owner_id' => 'New owner Owner ID goes here'
    );
     
    // Deal ID
    $deal_id = 'Deal ID goes here';
     
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
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
     
    // Check if an Deal ID came back, if did print out Owner ID of the new deal owner
    if (!empty($result['data']['id'])) {
      echo 'Existing deal is assigned to a new owner, the Owner ID:' . $result['data']['owner_id'] . PHP_EOL;
    }
    

Here's the Node.js version
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration, DealsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function assignDealToUser() {
      try {
        console.log('Sending request...');
    
        const dealsApi = new DealsApi(apiConfig);
    
        const DEAL_ID = 11; // id of the deal you want to update
    
        // Update deal owner
        const response = await dealsApi.updateDeal({
          id: DEAL_ID,
          UpdateDealRequest: {
            owner_id: 23943629, // id of the Owner you want to assign the deal to
          },
        });
    
        console.log('Assigned deal to a Owner successfully!', response);
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Assignment failed', errorToLog);
      }
    }
    
    assignDealToUser();

## 15\. ⛳️ Execute the code

Now run the command php updateDealOwner.php in terminal and you should see the following output:
    
    
    $ php updateDealOwner.php
    Sending request...
    Existing deal is now assigned to a new owner! New owner User ID: 2641280

Next 


---

**Source:** https://developers.pipedrive.com/tutorials/assigning-a-deal-to-certain-user-pipedrive-api
