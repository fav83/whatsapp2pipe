[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

What if both Persons have data in the same field?

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

What if both Persons have data in the same field?

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

## Merging Two Persons in Pipedrive via Pipedrive API

## 1\. Introduction

When merging, you'll want to pay attention to which Person you want **to be merged with** (conflicting data is kept) and which Person will be **merged** (conflicting data is removed). While the terminology may seem similar, knowing which Person has priority and which Person will be _removed_ is very important.

The ID of Person you want **to be merged with** will give value to the `merge_with_id` parameter. This Person will have priority over the other Person and its data will be kept.

The ID of the Person that will be **merged** will be added to the target URL. This Person will be removed from your Pipedrive account and any conflicting data will be lost.

## 2\. What if both Persons have data in the same field?

If both Persons have data in the same field, the Person of `merge_with_id` will be considered more important as its field data will remain unchanged, but the other Person's field data will be lost. If the Person of `merge_with_id` has empty fields, but the other Person has content in them, it will be added to the Person of `merge_with_id`.

Regardless of field conflicts, all related data (activities, emails, filters, notes, products, followers, participants) will be transferred and stored.

Continue with the step by step tutorial.

## 3\. Constructing the API call

Follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain).

Then create a file `mergeTwoPersons.php` and first give value to `$api_token` and `$company_domain` variables:
    
    
    <?php
    // Content of mergeTwoPersons.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
     
    // Pipedrive company domain
    $company_domain = 'Your company domain goes here';

When merging two Persons, there's one required parameter you have to give value to in the request body:

  * `merge_with_id` \- the ID of the Person, which will remain in your Pipedrive account and is **merged with** the other Person (conflicting data is kept)



To send the required parameter with your chosen value for the merging, you need to create an array with this parameter:
    
    
    // ID of the Person which will remain in your Pipedrive account and is merged withthe other Person
    $person = array(
      'merge_with_id' => 'ID of the Person that remains in your PD account and is merged with the other Person',
    );

To make a request, you'll need the correct URL meant for merging Persons. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/). You must provide the API token as part of the query string for all requests at the end of the URL, an example would look like this `https://{COMPANYDOMAIN}.pipedrive.com/api/v1/persons/190/merge?api_token=YOUR_API_TOKEN`.

In the URL you're using for merging two Persons, you need to specify which Person is going to be merged and eventually not be visible.

Here are the ways you can find the `person_id`:

  * go to _Contacts > People_ and click on the Person in the pipeline and find the ID at the end of the URL
  * fetch all Persons using the API via [`GET /persons`](https://developers.pipedrive.com/docs/api/v1/Persons#getPersons) (no need to use any parameters)



Now you need to insert the ID of the Person (that will be merged) instead of the placeholder of `{id}`:
    
    
    // Specify the Person you want to be merged by inserting it's ID instead of {id}
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/persons/{id}/merge?api_token=' . $api_token;

## 4\. Making the API call

The snippet below contains everything to make a `PUT` request with your data against our API. To make the request, simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($person));
      
    echo 'Sending request...' . PHP_EOL;
      
    $output = curl_exec($ch);
    curl_close($ch);

`$output` variable holds the full response you get back from the server. As a reminder, all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);

After that, you should check if the request was successful. One way to do it is to check the success property of the response. If it's `true`, then it means the Persons were merged successfully:
    
    
    // Check if the merging was successful.
    // If it did, print out the name of the Person the two Persons are now merged into
    if ($result['success'] === true) {
      echo 'Persons are now merged into a Person named '
        . $result['data']['name'] . ' (Person ID: ' . $result['data']['id'] . ')' . PHP_EOL;
    }

## 5\. Full working example (PHP)

Copy the full working example into `mergeTwoPersons.php`:
    
    
    <?php
    // Content of mergeTwoPersons.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
     
    // Pipedrive company domain
    $company_domain = 'Your company domain goes here';
     
    // ID of the Person which will remain in your Pipedrive account and is merged with the other Person
    $person = array(
      'merge_with_id' => 'ID of the Person that remains in your PD account and is merged with the other Person',
    );
     
    // Specify the Person you want to be merged by inserting it's ID instead of {id}
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/persons/{id}/merge?api_token=' . $api_token;
     
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($person));
      
    echo 'Sending request...' . PHP_EOL;
      
    $output = curl_exec($ch);
    curl_close($ch);
     
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
     
    // Check if the merging was successful
    // If it did, then print out the name of the Person the two Persons are now merged into
    if ($result['success'] === true) {
      echo 'Persons are now merged into a Person named '
        . $result['data']['name'] . ' (Person ID: ' . $result['data']['id'] . ')' . PHP_EOL;
    }

## 6\. Full working example (Node.js)
    
    
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();
    
    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    
    async function mergePersons() {
        try {
            console.log('Sending request...');
    
            const api = new pipedrive.PersonsApi(defaultClient);
    
            //required field(s): PERSON_ID and merge_with_id
            const PERSON_ID = 1;
            const data = {
                merge_with_id: 34753532
            }
            const response = await api.mergePersons(PERSON_ID, data);
    
            console.log(`Persons merged successfully!`, response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Merging persons failed', errorToLog);
        }
    }
    
    mergePersons();

## 7\. Execute the code

Now run the command `php mergeTwoPersons.php` in terminal and you should see the following output:
    
    
    $ php mergeTwoPersons.php
    Sending request...
    Persons are now merged into a Person named {Person name} (Person ID: {person_id})

Next 


---

**Source:** https://developers.pipedrive.com/tutorials/merging-two-persons-via-pipedrive-api
