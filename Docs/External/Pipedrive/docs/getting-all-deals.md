# Documentation

[← Back to tutorials](/tutorials)

## How to get deals from Pipedrive's API

## 1\. Introduction

Need to retrieve a list of deals from the Pipedrive API? This tutorial is for you. We'll walk you through the necessary steps to retrieve all deals associated with your Pipedrive account using PHP and cURL. There's also a Node.js snippet with the same logic.

Here's an overview of the steps involved:

  1. Obtain your Pipedrive API token and company domain
  2. Create a PHP script named `getAllDeals.php` to retrieve all deals in your Pipedrive account using cURL
  3. Inside the `getAllDeals.php` file, set the API token and company domain variables. You'll then use cURL to send a `GET` request to the Pipedrive API to retrieve all deals associated with your account
  4. Once you've received a response from the API, you'll convert the JSON data to a PHP array for easier manipulation
  5. Finally, you'll iterate through the array to display each deal's `title` and `id`



By the end of this tutorial, you'll have a working PHP script that retrieves a list of all deals in your Pipedrive account using our API.

💡You can also try out the [`GET /deals`](https://developers.pipedrive.com/docs/api/v1/Deals?_gl=1*1klq6bu*_ga*MTg4ODUyNzE0Ny4xNjQyNjkwNDk3*_ga_TNK73NC708*MTY3OTY0Nzk3My41MS4xLjE2Nzk2NDgxMTEuMC4wLjA.#getDeals) endpoint in our API Reference to get all information regarding all deals.

## 2\. Prerequisites: configure account details, credentials and the endpoint

Follow our tutorials on [how to find the API token](how-to-find-the-api-token.md) and [how to get the company domain](how-to-get-the-company-domain.md).

Once you've done that, create a file `getAllDeals.php` and give value to the `$company_domain` and `$api_token` variables:
    
    
    <?php
    // Content of getAllDeals.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
     
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';

To make a request, you'll need the correct URL for getting the deals listed, for example, `https://{YOUR_COMPANY_DOMAIN}.pipedrive.com/api/v2/deals?api_token=YOUR_API_TOKEN.`

You need to create a `$url` variable that holds the correct URL for listing the deals:
    
    
    // URL for Deal listing
    $url = 'https://'.$company_domain.'.pipedrive.com/api/v2/deals?limit=500&api_token=' . $api_token;

💡 We've set the limit of items shown per page to 500 (the maximum). The default limit is 100.

## 3\. Making the API call with the parameters set

Let's make a `GET` request with the necessary parameters against the API. Simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
     
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);
    

The `$output` variable holds the full response you get back from the server. As all responses from Pipedrive's API are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from the server is in JSON format, you need to convert it to a PHP array
    $result = json_decode($output, true);
    

Check if data returned in the result is not empty:
    
    
    if (empty($result['data'])) {
        exit('No deals created yet' . PHP_EOL);
    }

You can then loop over and echo the titles of the deals:
    
    
    // Iterate over all found Deals
    foreach ($result['data'] as $key => $deal) {
        $deal_title = $deal['title'];
           // Print out a deal title with its ID
           echo '#' . ($key + 1) . ' ' .  $deal['title'] . ' ' . '(Deal ID:'. $deal['id'] . ')' . PHP_EOL;  
    }

## 4\. Full working example (PHP)

Here is a full working example you can use for your `getAllDeals.php`:
    
    
    <?php
    // Content of getAllDeals.php
    
    // Pipedrive API token
    $api_token = 'Your API token goes here';
     
    // Pipedrive company domain
    $company_domain = 'Your company domain goes here';
    
    //URL for Deal listing with your $company_domain and $api_token variables
    $url = 'https://'.$company_domain.'.pipedrive.com/api/v2/deals?limit=500&api_token=' . $api_token;
      
    //GET request
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
        exit('No Deals created yet' . PHP_EOL);
    }
     
    // Iterate over all found Deals
    foreach ($result['data'] as $key => $deal) {
        $deal_title = $deal['title'];
           // Print out a deal title with its ID
           echo '#' . ($key + 1) . ' ' .  $deal['title'] . ' ' . '(Deal ID:'. $deal['id'] . ')' . PHP_EOL;  
    }

## 5\. Full working example (Node.js)

If you are using Node.js, you can use the following script:
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration, DealsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function getDeals() {
      try {
        console.log('Sending request...');
    
        const dealsApi = new DealsApi(apiConfig);
    
        // Get all deals
        const response = await dealsApi.getDeals();
    
        console.log('Got deals successfully!', response);
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Getting deals failed', errorToLog);
      }
    }
    
    getDeals();

## 6\. Successfully getting all deals

Use the `php getAllDeals.php` command to execute the code in the command line.

Here's an example output with 21 deals:
    
    
    $ php getAllDeals.php
    Sending request...
    #1 Batman deal (Deal ID: 1)
    #2 Big apple sale (Deal ID: 2)
    #3 Robin sale (Deal ID: 3)
    #4 Silly goose (Deal ID: 4)
    #5 Mademoiselle sale (Deal ID: 5)
    #6 Cats and dogs (Deal ID: 6)
    #7 Panna on vaja (Deal ID: 7)
    #8 Lucky (Deal ID: 8)
    #9 Call him now (Deal ID: 9)
    #10 Sending (Deal ID: 10)
    #11 Wolt (Deal ID: 11)
    #12 PD (Deal ID: 12)
    #13 The Explorer (Deal ID: 13)
    #14 The Carryall (Deal ID: 14)
    #15 The Pineapple (Deal ID: 15)
    #16 The Base (Deal ID: 16)
    #17 Kisser (Deal ID: 17)
    #18 Hugger (Deal ID: 18)
    #19 The Scholar (Deal ID: 19)
    #20 The Artist (Deal ID: 20)
    #21 The Ace (Deal ID: 21)
    

If you don't have any deals, this is the output you'll get:
    
    
    $ php getAllDeals.php
    Sending request...
    No Deals created yet
    
    

**🔗 For more adventures:**

Make sure to check the following resources:

  * **(Postman)**[Test the API using OAuth](https://www.postman.com/pipedrive-developers)
  * **(API Reference)**[Get all deals endpoint reference](https://developers.pipedrive.com/docs/api/v1/Deals#getDeals)



Next 
