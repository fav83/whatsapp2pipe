[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

What if both Deals have data in the same Field?

  3. 3

Get your API token, and company domain

  4. 4

Prepare the data for the merge

  5. 5

Define target URL

  6. 6

Make a PUT request

  7. 7

Check the result

  8. 8

Full working example (PHP)

  9. 9

Full working example (Node.js)

  10. 10

Execute the code




###### Topics

  1. 1

Introduction

  2. 2

What if both Deals have data in the same Field?

  3. 3

Get your API token, and company domain

  4. 4

Prepare the data for the merge

  5. 5

Define target URL

  6. 6

Make a PUT request

  7. 7

Check the result

  8. 8

Full working example (PHP)

  9. 9

Full working example (Node.js)

  10. 10

Execute the code




[← Back to tutorials](/tutorials)

## Merging two deals using Pipedrive API

## 1\. Introduction

When merging, you'll want to pay attention to which Deal you want to be merged with (conflicting data is kept) and which Deal will be merged (conflicting data is removed). While the terminology may seem similar, knowing which Deal has priority and which Deal will be removed is very important.

The ID of Deal you want to be merged with will give value to the merge_with_id parameter. This Deal will have priority over the other Deal and its data will be kept.

The ID of the Deal that will be merged will be added to the target URL. This Deal will be removed from your Pipedrive account and any conflicting data will be lost.

💡On how to merge deals in Pipedrive's web app, see [here](https://support.pipedrive.com/hc/en-us/articles/360005171958#C3).

## 2\. What if both Deals have data in the same Field?

If both Deals have data in the same Field, the Deal of merge_with_id will be considered more important as its field data will remain unchanged, but the other Deal's field data will be lost. If the Deal of merge_with_id has empty fields, but the other Deal has content in them, it will be added to the Deal of merge_with_id.

Regardless of field conflicts, all related data (activities, emails, filters, notes, products, followers, participants) will be transferred and stored.

Continue with the step-by-step tutorial:

## 3\. Get your API token, and company domain

Follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain). Then create a file mergingTwoDeals.php and first give value to the $api_token and $company_domain variables:
    
    
    <?php
    // Content of mergingTwoDeals.php
        
    // Pipedrive API sample token
    $api_token = 'YOUR_API_TOKEN';
        
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';

## 4\. Prepare the data for the merge

When merging two Deals, there's one required parameter you have to give value to in the request body:

  * merge_with_id - the ID of the Deal, which will remain in your Pipedrive account and is merged with the other Deal (conflicting data is kept)



Here are the ways you can find the deal_id:  
a) click on the Deal in the pipeline and find the ID at the end of the URL  
b) from the Deal List View ID column  
c) fetch all Deals using the API via [GET /deals](https://developers.pipedrive.com/docs/api/v1/Deals#getDeals) (no need to use any parameters)

To send the required parameter with your chosen value for the merging, you need to create an array with this parameter.
    
    
    // ID of the deal which will remain in your Pipedrive account and is merged with the other deal
    $deal = array(
      'merge_with_id' => 'ID of the deal, which will remain in your PD account and is merged with the other deal',
    );

## 5\. Define target URL

To make a request, you'll need the correct URL meant for merging Deals. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/). You must provide the API token as part of the query string for all requests at the end of the URL, an example would look like this https://{COMPANYDOMAIN}.pipedrive.com/api/v1/deals/190/merge?api_token=YOUR_API_TOKEN.

In the URL you're using for merging two Deals, you need to specify which Deal is going to be merged and eventually not be visible. Don't forget to replace the example URL's company name for _yours_. You also need to insert the ID of the Deal that will be merged instead of the placeholder of {id}.
    
    
    // Specify the Deal you want to be merged by inserting it's ID instead of {id}
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/deals/{id}/merge?api_token=' . $api_token;

## 6\. Make a PUT request

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a PUT request with your data against our API. To make the request, simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($deal));
      
    echo 'Sending request...' . PHP_EOL;
      
    $output = curl_exec($ch);
    curl_close($ch);
    
    

## 7\. Check the result

$output variable holds the full response you get back from the server. As a reminder, all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array.
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
    

After that, you should check if the request was successful. One way to do it is to check the success property of the response. If it's true, then it means the Deals were merged successfully.
    
    
    // Check if the merging was successful.
    // If it did, print out the title of the Deal the two Deals are now merged into
    if ($result['success'] === true) {
      echo 'Deals are now merged into a Deal called '
        . $result['data']['title'] . ' (Deal ID: ' . $result['data']['id'] . ')' . PHP_EOL;
    }
    

## 8\. Full working example (PHP)

Copy the full working example into mergingTwoDeals.php:
    
    
    <?php
    // Content of mergingTwoDeals.php
        
    // Pipedrive API sample token
    $api_token = 'YOUR_API_TOKEN';
        
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // ID of the Deal which will remain in your Pipedrive account and is merged with the other deal
    $deal = array(
      'merge_with_id' => 'ID of the Deal, which will remain in your PD account and is merged with the other deal',
    );
     
    // Specify the Deal you want to be merged by inserting it's ID instead of {id}
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/deals/{id}/merge?api_token=' . $api_token;
     
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($deal));
      
    echo 'Sending request...' . PHP_EOL;
      
    $output = curl_exec($ch);
    curl_close($ch);
     
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
     
    // Check if the merging was successful
    // If it did, then print out the title of the Deal the two Deals are now merged into
    if ($result['success'] === true) {
      echo 'Deals are now merged into a Deal called '
        . $result['data']['title'] . ' (Deal ID: ' . $result['data']['id'] . ')' . PHP_EOL;
    }
    

## 9\. Full working example (Node.js)
    
    
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();
    
    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    
    async function mergeTwoDeals() {
        try {
            console.log('Sending request...');
    
            const api = new pipedrive.DealsApi(defaultClient);
    
            const DEAL_ID = 33;  // ID of the deal you want to merge, this deal will be deleted
            const MERGE_WITH_ID = 35 // ID of the Deal which will remain in your Pipedrive account and is merged with the other deal
            const response = await api.mergeDeals(DEAL_ID, {
                merge_with_id: MERGE_WITH_ID
            })
    
            console.log(`Deals merged successfully!`, response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Merging deals failed', errorToLog);
        }
    }
    
    
    mergeTwoDeals();
    

## 10\. Execute the code

Now run the command php mergingTwoDeals.php in the terminal and you should see the following output:
    
    
    $ php mergingTwoDeals.php
    Sending request...
    Deals are now merged into a Deal called {Deal title} (Deal ID: {deal_id})
    

Next 


---

**Source:** https://developers.pipedrive.com/tutorials/merging-deals-pipedrive-api
