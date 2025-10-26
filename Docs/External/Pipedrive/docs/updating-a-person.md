# Documentation

[← Back to tutorials](/tutorials)

## Updating a Person in Pipedrive via Pipedrive API

## 1\. Get your API token and company domain

Follow our tutorials on [how to find the API token](how-to-find-the-api-token.md) and [how to get the company domain](how-to-get-the-company-domain.md). Then create a file `updatePerson.php` and first give value to the `$api_token` and `$company_domain` variables:
    
    
    <?php
    // Content of updatePerson.php
       
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
       
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';

## 2\. Prepare the data

In order to change the `name` parameter, simply add the new name you wish to give to the Person.

To change the Person's organization, you'll need to know the `org_id` of the new organization. You can fetch the `org_id` of an Organization via [`GET /organizations`](https://developers.pipedrive.com/docs/api/v1/Organizations#getOrganizations).

You can also find the `org_id` manually within the Pipedrive web app. Head to _Contacts > Organizations_ and click on the Organization you want, then the last digits shown in the URL will be the `org_id`. An example URL would look like this `https://{COMPANYDOMAIN}.pipedrive.com/organization/1`, which, in this case, means the `org_id` would be 1. You can also find the Organization's ID by adding the ID column to the Organization List View.

Insert the values to the designated fields `name` and `org_id`:
    
    
    // New name for the Person and new id of the organization they will belong to
    $data = array(
        'name' => 'Jane Doe',
        'org_id'=> 1
    );

## 3\. Define Person's ID

In order to update a Person, you'll need the `person_id`. You can fetch it via [`GET /persons`](https://developers.pipedrive.com/docs/api/v1/Persons#getPersons).

You can also find the `person_id` manually within the Pipedrive web app by going to _Contacts > People _and clicking on the Person whose ID you're interested in. Once you're in the Person's detail page, check the last digit(s) of the URL, this is the Person's ID. An example URL would be like this `https://{COMPANYDOMAIN}.pipedrive.com/person/13` which, in this **example** case, means the `person_id` would be 13.

Insert a **valid** value to the `$person_id` variable:
    
    
    // Person's ID
    $person_id = 13;

## 4\. Define target URL

To make a request, you'll need the correct URL for updating the necessary Person. An example with the `person_id` being 13 would look like this `https://{COMPANYDOMAIN}.pipedrive.com/api/v2/persons/13?api_token=YOUR_API_TOKEN`.

You need to create a `$url` variable which holds the correct URL for updating the Person:
    
    
    // URL for updating a Person
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/persons/' . $person_id . '?api_token=' . $api_token;

## 5\. Make a PATCH request

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a `PUT` request with your data against our API.

**Why PATCH?** Because we use `PATCH` to update resources and `POST` to create one as it is common in RESTful APIs. Read more about it [here](https://restfulapi.net/rest-put-vs-post/). 

To make the `PATCH` request, simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    
    echo 'Sending request...' . PHP_EOL;
    
    $output = curl_exec($ch);
    curl_close($ch);

## 6\. Check the result

`$output` variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to a PHP array
    $result = json_decode($output, true);

Then you can check if data returned in the result is not empty:
    
    
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Updating failed' . PHP_EOL);
    }

And now you can check if a `person_id` came back:
    
    
    if (!empty($result['data']['id'])) {
        $org_name = 'organization with ID ' . $result['data']['org_id'];
        echo 'Person\'s data was updated. The new name is ' . $result['data']['name'] . ' who now belongs to' . $org_name . '.' . PHP_EOL;
    }

## 7\. Full working example (PHP)

Copy the full working example into `updatePerson.php`. Don't forget to replace variables with your actual data:
    
    
    <?php
    // Content of updatePerson.php
    
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
    
    // New name for the Person and new id of the organization they will belong to
    $data = array(
        'name' => 'Jane Doe',
        'org_id'=> 1
    );
    
    // Person's ID
    $person_id = 13;
    
    
    // URL for updating a Person
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/persons/' . $person_id . '?api_token=' . $api_token;
    
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
    
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Updating failed' . PHP_EOL);
    }
    
    // Check if Person ID came back, if it did then print out the new name and the new organization name.
    if (!empty($result['data']['id'])) {
        $org_name = 'organization with ID ' . $result['data']['org_id'];
        echo 'Person\'s data was updated. The new name is ' . $result['data']['name'] . ' who now belongs to ' . $org_name . '.' . PHP_EOL;
    }

## 8\. Full working example (Node.js)
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration, PersonsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function updatePerson() {
      try {
        console.log('Sending request...');
    
        const personsApi = new PersonsApi(apiConfig);
    
        const PERSON_ID = 9; // id of the person you want to update
    
        // Update person 
        const data = {
          name: 'Jane Doe',
          org_id: 7,
        };
    
        const response = await personsApi.updatePerson({
          id: PERSON_ID,
          UpdatePersonRequest: data,
        });
    
        console.log('Person updated successfully!');
    
        // Check if the data returned is not empty
        if (!response.data || !response.data.id) {
          console.log('Updating failed');
          return;
        }
    
        // Print results 
        const orgName = 'organization with ID ' + response.data.org_id;
        console.log(
          "Person's data was updated. The new name is " +
            response.data.name +
            ' who now belongs to an ' +
            orgName +
            '.'
        );
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Person update failed', errorToLog);
      }
    }
    
    updatePerson();

## 9\. To execute the code

Use `php updatePerson.php` command to execute the code in the command line.

Here's an example output if the Person's data was updated:
    
    
    Sending request...
    Person's data was updated. The new name is Jane Doe who now belongs to an organization called Randomness.

Here's what you will see if the upgrade fails:
    
    
    Sending request...
    Updating failed

Next 
