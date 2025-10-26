[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

Prerequisites: get your company credentials and domain

  3. 3

Required parameters to create a deal

  4. 4

Making the API call

  5. 5

Checking if the deal was created successfully

  6. 6

Full working example (PHP)

  7. 7

Full working example (Node.js)

  8. 8

Running the code




###### Topics

  1. 1

Introduction

  2. 2

Prerequisites: get your company credentials and domain

  3. 3

Required parameters to create a deal

  4. 4

Making the API call

  5. 5

Checking if the deal was created successfully

  6. 6

Full working example (PHP)

  7. 7

Full working example (Node.js)

  8. 8

Running the code




[← Back to tutorials](/tutorials)

## How to create a deal via Pipedrive's API

## 1\. Introduction

Deals are one of the key entities in Pipedrive. You can use Pipedrive's REST API to create a deal programmatically.  


Follow the next steps to create a deal using PHP with our API.

Only want to see the finished code? No problem! You can find it in the later steps for both PHP and Node.js. You can also try adding a deal directly through our [**Postman collection**](https://www.postman.com/pipedrive-developers) using the [`POST /deals`](https://developers.pipedrive.com/docs/api/v1/Deals#addDeal) endpoint.

**💡** A deal is a visual representation of all actions taken towards the closing of a sale from start to finish. Deals will also automatically pull all contact information from the person/organization they're associated with.  
  
[Continue reading about deals](https://support.pipedrive.com/en/article/deals-what-they-are-and-how-to-add-them)

## 2\. Prerequisites: get your company credentials and domain

To create a new deal in Pipedrive using our API, you need to have your API token and company domain. If you're not sure how to find these, don't worry! We have tutorials that can guide you through the process: here's [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain).

Once you have your API token and company domain, you can start building the code to create a new deal. First, create a new file called `createDeal.php` and open it in your code editor. Make sure you provide the necessary values to the `$api_token` and `$company_domain` variables:

Then, copy the following code into the file:
    
    
    <?php
    // Content of createDeal.php
        
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
        
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
    

At any point, you can execute the code by using the `php getPersonFields.php` command in the command line.

## 3\. Required parameters to create a deal

When creating a deal, there is one compulsory parameter you must give a value to: the deal title. You can choose to give your new deal [additional parameters](https://developers.pipedrive.com/docs/api/v1/Deals#addDeal), such as the organization ID and person ID.

In this example, we are also going to add the organization this deal will be associated with. See [here](https://pipedrive.readme.io/docs/adding-an-organization) for how to add an organization.

Find the organization ID at the end of the URL:

### ![](/tutorials/_next/static/media/8a29def27d188b09.25e4e758.gif)

To send one or multiple parameters with your chosen values, you need to create an array of chosen parameters.
    
    
    // Deal title and Organization ID
    $deal = array(
      'title' => 'DEAL TITLE GOES HERE...',
      'org_id' => 'ORGANIZATION ID GOES HERE...'
    );

## 4\. Making the API call

To make a request, you'll need the correct URL meant for creating deals. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/Deals).

You must provide your company domain name and the API token as part of the query string for all requests at the end of the URL.

An example would look like this `https://{COMPANYDOMAIN}.pipedrive.com/api/v2/deals?api_token=YOUR_API_TOKEN`  
You need to create a `$url` variable which holds correct URL for Deal creation and add your `$api_token` variable to it:
    
    
    $url = 'https://'.$company_domain.'.pipedrive.com/api/v2/deals?api_token=' . $api_token;
    

Depending on the language of choice, you will be using an HTTP client library to make the API call. In our case, we use cURL since we are working with PHP code.

Simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $deal);
     
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);

## 5\. Checking if the deal was created successfully

The `$output` variable holds the full response you get back from the server. As all responses from Pipedrive's API are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array.
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from the server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
    

After that, you should check if the `id` came back as part of returned data. If it did, then this means that a new deal was added successfully.
    
    
    // Check if an ID came back, if did print it out
    if (!empty($result['data']['id'])) {
      echo 'Deal was added successfully!' . PHP_EOL;
    }

## 6\. Full working example (PHP)
    
    
    <?php
    // Content of createDeal.php
    
    // Pipedrive API token
    $api_token = '<API_TOKEN>';
        
    // Pipedrive company domain
    $company_domain = 'theunicorntail';
    
    // Now you first insert your deal title and then the user ID
    $deal = array(
        "title" => '111 deal',
        "owner_id" => 123123123123
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
    
    // Check if an Deal ID came back, if did print out User ID of the new deal owner
    if (!empty($result['data']['id'])) {
        echo 'New deal added for user ' . $result['data']['owner_id'] . PHP_EOL;
    }
    

## 7\. Full working example (Node.js)
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration, DealsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function addDeal() {
      try {
        console.log('Sending request...');
    
        const dealsApi = new DealsApi(apiConfig);
    
        // Required field: title
        const data = {
          title: 'Deal of the century',
          value: 10000,
          currency: 'USD',
          person_id: null,
          org_id: null,
          stage_id: 1,
          status: 'open',
          expected_close_date: '2022-02-11',
          probability: 60,
          visible_to: 1,
        };
    
        const response = await dealsApi.addDeal({
          AddDealRequest: data,
        });
    
        console.log('Deal was added successfully!', response);
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Adding failed', errorToLog);
      }
    }
    
    addDeal();

## 8\. Running the code

Now run the command `php createDeal.php` in the terminal, and you should see the following output:
    
    
    $ php createDeal.php
    Sending request...
    Deal was added successfully!

Next 


---

**Source:** https://developers.pipedrive.com/tutorials/create-a-deal-pipedrive-api
