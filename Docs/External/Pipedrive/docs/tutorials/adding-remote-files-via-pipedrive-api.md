[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

A. Creating a remote file and link it to an item

  3. 3

Full code example (PHP)

  4. 4

Full code example (Node.js)

  5. 5

B. Linking an existing remote file to an item

  6. 6

Code example




###### Topics

  1. 1

Introduction

  2. 2

A. Creating a remote file and link it to an item

  3. 3

Full code example (PHP)

  4. 4

Full code example (Node.js)

  5. 5

B. Linking an existing remote file to an item

  6. 6

Code example




[← Back to tutorials](/tutorials)

## Adding remote files via Pipedrive API

## 1\. Introduction

Remote files are files that are stored on a remote location and not, for example, on your local drive. Currently, we only support files that originate from **Google Drive**.

For adding remote files in Pipedrive we have two endpoints [`POST /files/remote`](https://developers.pipedrive.com/docs/api/v1/Files#addFileAndLinkIt) and [`POST /files/remoteLink`](https://developers.pipedrive.com/docs/api/v1/Files#linkFileToItem). The following tutorial will cover code samples and explanations for working with those endpoints.

  * [`POST /files/remote`](https://developers.pipedrive.com/docs/api/v1/Files#addFileAndLinkIt) allows you to create a new file in Google Drive and specify which item (Deal, Person or Organization) that created file will be linked and associated to in Pipedrive.   

  * With [`POST /files/remoteLink`](https://developers.pipedrive.com/docs/api/v1/Files#linkFileToItem) you can link a file that already exists in Google Drive to an item (Deal, Person or Organization).



The user needs to have an [activated Google Account](https://app.pipedrive.com/settings/google/) in Pipedrive for the files to be added successfully.

## 2\. A. Creating a remote file and link it to an item

First, you need to think about how you authenticate your request to our API. You can use either an API token (see the code snippet below) or [OAuth](https://pipedrive.readme.io/docs/marketplace-oauth-api). For more information about authenticating your requests, see [authentication](https://pipedrive.readme.io/docs/core-api-concepts-authentication).
    
    
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
    // URL for creating an empty remote file and associate it with an item
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/files/remote?api_token=' . $api_token;
    

You also need to give values to the following parameters and make the **`POST`** request. You can see the full code example below.

**Parameter** | **Examples and explanations**  
---|---  
`file_type` (required) | Choose one of the following:

  * `gdoc` (Google Document)
  * `gslides` (Google Slides)
  * `gsheet` (Google Sheet)
  * `gform` (Google From)
  * `gdraw` (Google Drawing)

  
`title` (required) | Title of the created file  
`item_type` (required) | Choose one of the following items:

  * `deal`
  * `person`
  * `organization`

  
`item_id` (required) | The ID of the specific item you wish to have the created file linked with. The file will appear in the details view of this specific item.  
`remote_location` (required) | `googledrive`  
  
## 3\. Full code example (PHP)

Don't forget to authenticate your request. You can use the following URL for a request with `api_token`.
    
    
    // URL for creating an empty remote file and linking it with an item
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/files/remote?api_token=' . $api_token;
    

Here's the PHP code snippet
    
    
    <?php
    //add authentication with api_token here
    $data = array(
        'file_type' => gdoc,
        'title' => 'New proposal for John Doe',
        'item_type' => deal,
        'item_id' => 12,
        'remote_location'=> googledrive
    );
      
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
        echo 'File created and linked successfully! ' . PHP_EOL;
    }
    

## 4\. Full code example (Node.js)

And the Node.js equivalent
    
    
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();
    
    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    
    async function addRemoteFile() {
        try {
            console.log('Sending request...');
    
            const api = new pipedrive.FilesApi(defaultClient);
    
            // you can assign a file to a deal , person , organization , activity or product by setting the itemType and itemId
            const fileType = 'gdoc';
            const title = 'File 1';
            const itemId = 35;
            const itemType = 'deal';
            const remoteLocation = 'googledrive';
            const response = await api.addFileAndLinkIt(fileType, title, itemType, itemId, remoteLocation)
    
            console.log('File successfully added and linked', response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Adding failed', errorToLog);
        }
    }
    
    addRemoteFile();
    

## 5\. B. Linking an existing remote file to an item

To link an existing remote file to an item you need first authenticate your request and then add values to the following parameters. The user needs to have an [activated Google Account](https://app.pipedrive.com/settings/google) in Pipedrive for the file to be added successfully. You can see the full code example below.

**Parameters** | **Examples and explanations**  
---|---  
`item_type` (required) | Choose one of the following items:

  * `deal`
  * `person`
  * `organization`

  
`item_id` (required) | The ID of the specific item you wish to have the created file linked with. The file will appear in the details view of this specific item.  
`remote_id` (required) | `remote_id` of the file is dependent on the location of the file. If the file is already uploaded to your Pipedrive account, you can get the ID by making a request to [`GET /files`](https://developers.pipedrive.com/docs/api/v1/Files#getFiles) endpoint. If you want to link a file that you don't have in your Pipedrive account, you can get the `remote_id` by adding the needed file to the designated Pipedrive folder in your Google Drive (the folder appears when you have[ Google Drive integration's folders enabled](https://app.pipedrive.com/settings/files). Next, when you open the selected file you can see the file's remote_id as a part of the URL. e.g: `https://docs.google.com/document/d/123magicfile123/edit where 123magicfile123` would be the file's `remote_id`.  
`remote_location` (required) | `googledrive`  
  
## 6\. Code example

Don't forget to authenticate your request. You can use the following URL for a request with `api_token`.
    
    
    // URL for linking an existing remote file
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v1/files/remoteLink?api_token=' . $api_token;
    
    

Complete sample code can be found below:
    
    
    <?php
    //Add authentication with api_token here
    $data = array(
        'item_type' => deal,
        'item_id' => 12,
        'remote_id' => 'magic-file-123',
        'remote_location'=> googledrive
    ); 
     
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
        exit('Linking failed' . PHP_EOL);
    }
     
    // Check if file ID came back, if it did, print out success message
    if (!empty($result['data']['id'])) {
        echo 'File linked successfully! ' . PHP_EOL;
    }
    

Next 


---

**Source:** https://developers.pipedrive.com/tutorials/adding-remote-files-via-pipedrive-api
