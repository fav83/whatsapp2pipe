# Documentation

[← Back to tutorials](/tutorials)

## Adding a File via Pipedrive API

## 1\. Introduction

In Pipedrive, you're able to add several different types of files - images, spreadsheets, text files, etc. You can also associate files with a Deal, Lead, Person, Organization, Activity or even a Product. In this example, we're going to add a text file and connect it to a Person, so it'll appear in the details view of that Person. If you want to see the finished code for adding a file, you can find it below in PHP and Node.js. 

You can also try adding a file through our [Postman API collection](https://www.postman.com/pipedrive-developers/) using the [`POST /files`](https://developers.pipedrive.com/docs/api/v1/Files#addFile) endpoint.

## 2\. Get your API token and company domain

Follow our tutorials on [how to find the API token](how-to-find-the-api-token.md) and [how to get the company domain](how-to-get-the-company-domain.md) . Then create a file `addFile.php` and first give value to the `$api_token` and `$company_domain` variables:
    
    
    <?php
    // Content of addFile.php
        
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
        
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';

## 3\. Payload for adding a file

In order to add a new file, there's only one parameter you need to give value to - the `file` parameter. This can be done using a cURL function, which creates a CURLFile object.

Next, a file path must be added. When adding the file path, it's suggested to have the file you want to add in the same folder as the code file triggering the process. This way you can just write the file name after **./** and the file will be added properly. If the file is located in some other place on your computer, be sure to enter a proper file path based on the location (file paths differ for different operating systems).

You can also associate a file with a Deal, Organization, Person, Activity, or Product. To do that, you need to know the specific ID of that item. To see more information, you can check our [API Reference](https://developers.pipedrive.com/docs/api/v1/Files#addFile). In this example, we're going to associate the file with a Person, so it will appear in the details view of that Person.
    
    
    // Location of the file and person ID of the person to whom you assign the file
    $data = array(
        'file' => curl_file_create('./testfile.docx'),
        'person_id' => 16
    );

## 4\. Making the API request

To make a request, you'll need the correct URL meant for adding files. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/). You must provide the API token as part of the query string for all requests at the end of the URL, an example would look like this `https://{COMPANYDOMAIN}.pipedrive.com/api/v1/files?api_token=YOUR_API_TOKEN`.

You need to create a `$url` variable that holds the correct URL for file adding and add `$api_token` variable to it:
    
    
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/files?api_token=' . $api_token;

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a POST request with your data against our API. Simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
     
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);
    

## 5\. Check the result

$output variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);

Then you can check if data returned in the result is not empty:
    
    
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Adding failed' . PHP_EOL);
    }
    

And now you should check if file ID came back as returned data. If it did, then this means that the file was added successfully.
    
    
    // Check if file ID came back, if it did, print out success message
    if (!empty($result['data']['id'])) {
        echo 'File added successfully! ' . PHP_EOL;
    }

You can also check the changes in the Pipedrive web app in the item's details view, where you added the file. In this example, it would be seen in the details view of the Person with the person_id of 16.

## 6\. Full working example (PHP)

Copy the full working example into `addFile.php`. Don't forget to replace variables with your actual data:
    
    
    <?php
    // Content of addFile.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // Location of the file and person ID of the person to whom you assign the file
    $data = array(
        'file' => curl_file_create('./testfile.docx'),
        'person_id' => 16
    );
     
    // URL for adding a file
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/files?api_token=' . $api_token;
     
     
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
     
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
     
    // Check if file ID came back, if it did, print out success message
    if (!empty($result['data']['id'])) {
        echo 'File added successfully! ' . PHP_EOL;
    }

## 7\. Full working example (Node.js)
    
    
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();
    
    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    
    async function addFile() {
        try {
            console.log('Sending request...');
    
            const api = new pipedrive.FilesApi(defaultClient);
    
            const filepath = './example.txt'; // the filepath for the file you want to attach
    
            // you can assign a file to a deal, person, organization, activity or product by including the appropriate resource id
            const response = await api.addFile(filepath, {
                dealId: 1,
                // personId: 1,
                // orgId: 1,
                // activityId: 1,
                // productId: 1
            })
    
            console.log('File was added successfully!', response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Adding a file failed', errorToLog);
        }
    }
    
    addFile();
    

## 8\. Execute the Code

Use `php addFile.php` command to execute the code in the command line. Here's an example output if the file was added:
    
    
    Sending request...
    File added successfully!

If adding the file failed, this is the output you'll get:
    
    
    Sending request...
    Adding failed

Next 
