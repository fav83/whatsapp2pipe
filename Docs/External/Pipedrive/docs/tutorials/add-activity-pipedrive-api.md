[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

Get your API token, and company domain

  3. 3

Prepare the data

  4. 4

Define target URL

  5. 5

Make a POST request

  6. 6

Checking the result

  7. 7

Full Example (PHP)

  8. 8

Full Example (Node.js)

  9. 9

Execute the code




###### Topics

  1. 1

Introduction

  2. 2

Get your API token, and company domain

  3. 3

Prepare the data

  4. 4

Define target URL

  5. 5

Make a POST request

  6. 6

Checking the result

  7. 7

Full Example (PHP)

  8. 8

Full Example (Node.js)

  9. 9

Execute the code




[← Back to tutorials](/tutorials)

## Adding an activity using Pipedrive API

## 1\. Introduction

Let's say you want to add a new lunch Activity to an existing deal. For that, you'd need to provide the subject of the Activity (e.g. Discuss revenue with John) and the type of Activity (e.g. lunch). You can test out adding an Activity also in [POST /activities](https://developers.pipedrive.com/docs/api/v1/Activities#addActivity) and see the full code example below in PHP and Node.js.

Follow the next steps to see how to do it.

## 2\. Get your API token, and company domain

Follow our tutorials on [how to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) and [how to get the company domain](https://pipedrive.readme.io/docs/how-to-get-the-company-domain). Then create a file `addActivity.php` and first give value to the `$api_token` and `$company_domain` variables:
    
    
    <?php
    // Content of addActivity.php
        
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
        
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
    
    

## 3\. Prepare the data

When adding an Activity, there are two required parameters you should give value to - `subject` and `type`. `subject` represents the title of the Activity and `type` represents the type of that Activity. `type` is in correlation with the `key_string` parameter of ActivityTypes which you can fetch in our [API reference](https://developers.pipedrive.com/docs/api/v1/ActivityTypes#getActivityTypes). You can give the new Activity [additional parameters](https://developers.pipedrive.com/docs/api/v1/Activities#addActivity) as well. In this tutorial, we are going to associate the new Activity with a deal. To send one or multiple parameters with your chosen values, you need to create an array of these chosen parameters:
    
    
    // Information regarding the new activity
    $data = array(
        'subject' => 'Discuss revenue with John',
        'type' => 'lunch',
        'deal_id' => 42
    );

## 4\. Define target URL

To make a request, you'll need the correct URL meant for adding Activities. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1). You must provide the API token as part of the query string for all requests at the end of the URL, an example would look like this `https://{COMPANYDOMAIN}.pipedrive.com/v2/activities?api_token=YOUR_API_TOKEN.`

You need to create a `$url` variable that holds the correct URL for adding an Activity:
    
    
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/activities?api_token=' . $api_token;

## 5\. Make a POST request

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a `POST` request with your data against our API. Simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);

## 6\. Checking the result

`$output` variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
    

Then you can check if data returned in the result is not empty:
    
    
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Adding failed' . PHP_EOL);
    }

And now you should check if the Activity's ID came back as returned data. If it did, then this means that the Activity was added successfully.
    
    
    // Check if the Activity's ID came back, if it did, print out success message
    if (!empty($result['data']['id'])) {
        echo 'Activity added successfully! ' . PHP_EOL;
    }

## 7\. Full Example (PHP)

Copy the full working example into `addActivity.php`. Don't forget to replace variables with your actual data:
    
    
    <?php
    // Content of addActivity.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // Information regarding the new Activity
    $data = array(
        'subject' => 'Discuss revenue with John',
        'type' => 'lunch',
        'deal_id' => 42
    );
     
    // URL for adding an Activity
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/activities?api_token=' . $api_token;
     
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
     
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Adding failed' . PHP_EOL);
    }
    // Check if the Activity's ID came back, if it did, print out success message
    if (!empty($result['data']['id'])) {
        echo 'Activity was added successfully!' . PHP_EOL;
    }

## 8\. Full Example (Node.js)

If you are using Node.js, you can make use of the following script
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration, ActivitiesApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function addAnActivity() {
      try {
        console.log('Sending request...');
    
        const activitiesApi = new ActivitiesApi(apiConfig);
    
        // Required fields: subject, type
        const data = {
          subject: 'Discuss revenue with John',
          type: 'lunch',
        };
    
        const response = await activitiesApi.addActivity({
          AddActivityRequest: data,
        });
    
        console.log('Activity was added successfully!', response);
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Adding failed', errorToLog);
      }
    }
    
    addAnActivity();

## 9\. Execute the code

Use `php addActivity.php` command to execute the code in the command line. Here's an example output if the Activity was added:
    
    
    Sending request...
    Activity added successfully!

If adding the Activity failed, this is the output you'll get:
    
    
    Sending request...
    Adding failed

**🔗 For more adventures:**

Make sure to check the following resources:

  * **(API Reference)**[Adding Activities](https://developers.pipedrive.com/docs/api/v1/Activities)
  * **(Sample Apps)**[Pipedrive Example Apps](https://github.com/pipedrive/example-apps)



Next 


---

**Source:** https://developers.pipedrive.com/tutorials/add-activity-pipedrive-api
