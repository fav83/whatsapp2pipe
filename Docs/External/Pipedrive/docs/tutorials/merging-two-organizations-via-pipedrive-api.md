[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

What if both Organizations have data in the same field?

  3. 3

Constructing the API call

  4. 4

Making the API call

  5. 5

Full working example (PHP)

  6. 6

Full working example (Node.js)

  7. 7

Execute the code




###### Topics

  1. 1

Introduction

  2. 2

What if both Organizations have data in the same field?

  3. 3

Constructing the API call

  4. 4

Making the API call

  5. 5

Full working example (PHP)

  6. 6

Full working example (Node.js)

  7. 7

Execute the code




[← Back to tutorials](/tutorials)

## Merging Two Organizations via Pipedrive API

## 1\. Introduction

When merging, you'll want to pay attention to which Organization you want **to be merged with** (conflicting data is kept) and which Organization will be **merged** (conflicting data is removed). While the terminology may seem similar, knowing which Organization has priority and which Organization will be _removed_ is very important.

The ID of Organization you want **to be merged with** will give value to the `merge_with_id` parameter. This Organization will have priority over the other Organization and its data will be kept.

The ID of the Organization that will be **merged** will be added to the target URL. This Organization will be removed from your Pipedrive account and any conflicting data will be lost.

## 2\. What if both Organizations have data in the same field?

If both Organizations have data in the same field, we will merge data from both where possible (e.g., text fields). For fields where merging isn't feasible (e.g., numeric fields), the Organization specified by `merge_with_id` takes priority - its data will be preserved, and conflicting data from the other Organization will be discarded. If the Organization specified by `merge_with_id` has empty fields that are populated in the other Organization, the populated data will be carried over.

Regardless of field conflicts, all related data (activities, emails, filters, notes, products, followers, participants) will be transferred and stored.

Continue with the step by step tutorial:

## 3\. Constructing the API call

Follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain).

Then create a file `mergeTwoOrganizations.php` and first give value to `$api_token` and `$company_domain` variables:
    
    
    <?php
    // Content of mergeTwoOrganizations.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
     
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';

When merging two Organizations, there's one required parameter you have to give value to in the request body:

  * `merge_with_id` \- the ID of the Organization, which will remain in your Pipedrive account and is **merged with** the other Organization (conflicting data is kept)



To send the required parameter with your chosen value for the merging, you need to create an array with this parameter:
    
    
    // ID of the Organization which will remain in your Pipedrive account and is merged with the other Organization
    $organization = array(
      'merge_with_id' => 'ID of the Organization that remains in your PD account',
    );

To make a request, you'll need the correct URL meant for merging Organizations. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/). You must provide the API token as part of the query string for all requests at the end of the URL, an example would look like this `https://{COMPANYDOMAIN}.pipedrive.com/api/v1/organizations/190/merge?api_token=YOUR_API_TOKEN`.

In the URL you're using for merging two Organizations, you need to specify which Organization will merge and eventually not be visible.

Here are the ways you can find the organization_id:

  * go to _Contacts > Organizations_ and click on the Organization in the pipeline and find the ID at the end of the URL
  * fetch all Organizations using the API via [`GET /organizations`](https://developers.pipedrive.com/docs/api/v1/Organizations#getOrganizations) (no need to use any parameters)



Now you need to insert the ID of the Organization (that will be merged) instead of the placeholder of `{id}`:
    
    
    // Specify the Organization you want to be merged by inserting it's ID instead of {id}
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/organizations/{id}/merge?api_token=' . $api_token;

## 4\. Making the API call

The snippet below contains everything to make a `PUT` request with your data against our API. To make the request, simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($organization));
      
    echo 'Sending request...' . PHP_EOL;
      
    $output = curl_exec($ch);
    curl_close($ch);

`$output` variable holds the full response you get back from the server. As a reminder, all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);

After that, you should check if the request was successful. One way to do it is to check the success property of the response. If it's `true`, then it means the Organizations were merged successfully.
    
    
    // Check if the merging was successful.
    // If it did, print out the name of the Organization the two Organizations are now merged into
    if ($result['success'] === true) {
      echo 'Organizations are now merged into one. The ID of the remaining ' . 'Organization: ' . 
      $result['data']['id'] . PHP_EOL;
    }

## 5\. Full working example (PHP)

Copy the full working example into `mergeTwoOrganizations.php`:
    
    
    <?php
    // Content of mergeTwoOrganizations.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
     
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // ID of the Organization which will remain in your Pipedrive account and is merged with the other Organization
    $organization = array(
      'merge_with_id' => 'ID of the Organization that remains in your PD account',
    );
    
    // Specify the Organization you want to be merged by inserting it's ID instead of {id}
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/organizations/{id}/merge?api_token=' . $api_token;
     
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($organization));
      
    echo 'Sending request...' . PHP_EOL;
      
    $output = curl_exec($ch);
    curl_close($ch);
     
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
     
    // Check if the merging was successful.
    // If it did, print out the name of the Organization the two Organizations are now merged into
    if ($result['success'] === true) {
      echo 'Organizations are now merged into one. The ID of the remaining ' . 'Organization: ' . 
      $result['data']['id'] . PHP_EOL;
    }

## 6\. Full working example (Node.js)
    
    
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();
    
    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    
    async function mergeOrganizations() {
        try {
            console.log('Sending request...');
    
            const api = new pipedrive.OrganizationsApi(defaultClient);
    
            //required field(s): ORGANIZATION_ID and merge_with_id
            const ORGANIZATION_ID = 1;
            const SECOND_ORGANIZATION = 2;
            const data = {
                merge_with_id: SECOND_ORGANIZATION
            }
            const response = await api.mergeOrganizations(ORGANIZATION_ID, data);
    
            console.log(`Organizations merged successfully!`, response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Merging organizations failed', errorToLog);
        }
    }
    
    mergeOrganizations();

## 7\. Execute the code

Now run the command `php mergeTwoOrganizations.php` in terminal and you should see the following output:
    
    
    $ php mergeTwoOrganizations.php
    Sending request...
    Organizations are now merged into one. The ID of the remaining Organization: {organization_id})

Next 


---

**Source:** https://developers.pipedrive.com/tutorials/merging-two-organizations-via-pipedrive-api
