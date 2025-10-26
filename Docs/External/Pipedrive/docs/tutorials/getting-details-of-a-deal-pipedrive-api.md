[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

GET your API token and company domain

  3. 3

Prepare the data

  4. 4

Define target URL

  5. 5

Make a GET request

  6. 6

Check the result

  7. 7

Full working example

  8. 8

To execute the code




###### Topics

  1. 1

Introduction

  2. 2

GET your API token and company domain

  3. 3

Prepare the data

  4. 4

Define target URL

  5. 5

Make a GET request

  6. 6

Check the result

  7. 7

Full working example

  8. 8

To execute the code




[← Back to tutorials](/tutorials)

## Getting details of a Deal using Pipedrive API

## 1\. Introduction

Follow the next steps to get details of a Deal using our API.

Only want to see the finished code for getting the details of a Deal? No problem, you can find it below in PHP and in Node.js! You can also try out using [`GET /deals/{id}`](https://developers.pipedrive.com/docs/api/v1/Deals#getDeal) in our API Reference.

## 2\. GET your API token and company domain

Follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain).

Then create a file `getDetailsOfDeal.php` and first give value to the `$api_token` and `$company_domain` variables:
    
    
    <?php
    // Content of getDetailsOfDeal.php
     
    // Pipedrive API token
    $api_token = 'Your API token goes here';
     
    // Pipedrive company domain
    $company_domain = 'Your company domain goes here';
    

## 3\. Prepare the data

Now you'll need the Deal ID which you can get via [`GET /deals`](https://developers.pipedrive.com/docs/api/v1/Deals#getDeals) (without passing along any parameters). You can check our getting all Deals tutorial if you need help with that.

You can also find it manually by going to the Deals pipeline view in the Pipedrive web app and clicking on the Deal you're interested in. Then check the last digit(s) of the URL. An example URL would look like this `https://companydomain.pipedrive.com/deal/222` which, in this case, means the Deal ID would be 222.

Insert the Deal ID by giving value to the `$deal_id` variable:
    
    
    // Deal ID
    $deal_id = 0;

## 4\. Define target URL

To make a request, you'll need the correct URL to get the desired Deal's details. An example would look like this `https://{COMPANYDOMAIN}.pipedrive.com/api/v2/deals/222?api_token=`.

You need to create a $url variable which holds the correct URL for getting the details of the Deal:
    
    
    // URL for getting the details of a Deal
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/deals/' . $deal_id . '?api_token=' . $api_token;
    

## 5\. Make a GET request

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a `GET` request with your data against our API.

Simply copy and paste this:
    
    
    // GET request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      
    echo 'Sending request...' . PHP_EOL;
      
    $output = curl_exec($ch);
    curl_close($ch);
    

## 6\. Check the result

`$output` variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to a PHP array
    $result = json_decode($output, true);

Then you can check if data returned in the result is not empty:
    
    
    // Check if data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Error: ' . $result['error'] . PHP_EOL);
    }

If the Deal is found, then you can show the details of the Deal:
    
    
    // If the Deal is found, show Deal details
    if ($result['data']) {
        echo 'Here are the details of Deal ' . $result['data']['id'] . ':' . PHP_EOL;
     
        // Print out full data of found Deal
        print_r($result['data']);
    }

## 7\. Full working example

Copy the full working example into `getDetailsOfDeal.php`:
    
    
    <?php
    // Content of getDetailsOfDeal.php
     
    // Pipedrive API token
    $api_token = 'Your API token goes here';
     
    // Pipedrive company domain
    $company_domain = 'Your company domain goes here';
    
    // Deal ID
    $deal_id = 0;
    
    // URL for getting the details of a Deal
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/deals/' . $deal_id . '?api_token=' . $api_token;
    
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
    
    // If the Deal is found, show Deal details
    if ($result['data']) {
        echo 'Here are the details of Deal ' . $result['data']['id'] . ':' . PHP_EOL;
     
        // Print out full data of found Deal
        print_r($result['data']);
    }

Here's the Node.JS snippet
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration, DealsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function getDealDetails() {
      try {
        console.log('Sending request...');
    
        const dealsApi = new DealsApi(apiConfig);
    
        const DEAL_ID = 11; // id of the deal you want to get the details for
    
        // Get deal details
        const deal = await dealsApi.getDeal({
          id: DEAL_ID,
        });
    
        console.log('Got a deal successfully!', deal);
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Getting deal details failed', errorToLog);
      }
    }
    
    getDealDetails();

## 8\. To execute the code

Use `php getDetailsOfDeal.php` command to execute the code in the command line.

Here's an example output for a Deal:
    
    
    $ php get_details_of_deal.php
    Sending request...
    Array
    (
        [id] => 222
        [creator_user_id] => Array
            (
                [id] => 2002222
                [name] => Jane Doe
                [email] => username@website.com
                [has_pic] => 1
                [pic_hash] => 0000d23c65289ba4b0e398f81ab64429
                [active_flag] => 1
                [value] => 2002222
            )
     
        [user_id] => Array
            (
                [id] => 2002222
                [name] => Jane Doe
                [email] => username@website.com
                [has_pic] => 1
                [pic_hash] => 0000d23c65289ba4b0e398f81ab64429
                [active_flag] => 1
                [value] => 2002222
            )
     
        [person_id] => Array
            (
                [name] => Me
                [email] => Array
                    (
                        [0] => Array
                            (
                                [value] =>
                                [primary] => 1
                            )
     
                    )
     
                [phone] => Array
                    (
                        [0] => Array
                            (
                                [value] =>
                                [primary] => 1
                            )
     
                    )
     
                [value] => 138
            )
     
        [org_id] =>
        [stage_id] => 22
        [title] => Call Cindy
        [value] => 0
        [currency] => XBT
        [add_time] => 2018-05-30 08:58:30
        [update_time] => 2018-05-30 11:00:45
        [stage_change_time] => 2018-05-30 09:43:35
        [active] => 1
        [deleted] =>
        [status] => open
        
    ...
     
    )

If the Deal doesn't exist, that's the output you'll get:
    
    
    $ php getDetailsOfDeal.php
    Sending request...
    Error: Deal not found
    

**🔗 For more adventures:**

Make sure to check the following resources:

  * **(API Reference)**[Deals](https://developers.pipedrive.com/docs/api/v1/Deals)
  * **(Sample Apps)**[Pipedrive Example Apps](https://github.com/pipedrive/example-apps)



Next 


---

**Source:** https://developers.pipedrive.com/tutorials/getting-details-of-a-deal-pipedrive-api
