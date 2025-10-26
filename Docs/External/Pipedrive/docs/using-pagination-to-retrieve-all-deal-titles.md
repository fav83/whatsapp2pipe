# Documentation

[← Back to tutorials](/tutorials)

## Pagination using Pipedrive API

## 1\. Introduction

You've learned from our Pipedrive API Documentation that [the pagination](core-api-concepts-pagination.md) max limit value is 500. So what do you do when your amount of Deals exceeds this 500 limit?

One way to solve your problem is to define a reusable function which can be used recursively to retrieve all Deals page-by-page without writing the same code (making a request, getting a response, checking if another request is needed, and then repeating it) over and over again. The comments inside the code blocks will help you if needed.

Only want to see the finished code for getting titles of all Deals? No problem, you can find it below!

## 2\. Get your API token and company domain

Follow our tutorials on [how to find the API token](how-to-find-the-api-token.md) and [how to get the company domain](how-to-get-the-company-domain.md).

Then create a file getAllDealTitles.php and give value to all three constants:
    
    
    <?php
    // Content of getAllDealTitles.php
      
    // Insert your Pipedrive API token
    const API_TOKEN = 'YOUR_API_TOKEN';
     
    // Insert your Pipedrive company domain
    const COMPANY_DOMAIN = 'YOUR_COMPANY_DOMAIN';
     
    // Insert number of Deals per page you want to retrieve (cannot exceed 500 due to the pagination limit)
    const DEALS_PER_PAGE = 10;
    

## 3\. Logic for handling pagination

**Step 1: Define the function and its parameters**

The `getDeals` function retrieves deals from the Pipedrive CRM. It takes two parameters: `$limit` (number of deals per page) and `$cursor` (pagination start position).
    
    
    $deals = getDeals();

**Step 2: Construct the API URL and send a request**

The function constructs the API URL using the provided parameters and Pipedrive constants. It initializes a cURL session, sets the URL and other options.

**Step 3: Send the request and retrieve the response**

The cURL request is sent using `curl_exec()` and the response is stored in `$output`. The cURL session is closed.

**Step 4: Process the response**

The response, in JSON format, is converted to a PHP array using `json_decode()`. The deals are added to the `$deals` array if they exist. If there are no deals, the response is printed.

**Step 5: Handle pagination**

If there are more items in the collection, the function calls itself recursively with an increased `$cursor` parameter. This retrieves the next set of deals and merges them with the existing `$deals` array.

Finally, the function returns the `$deals` array containing all the retrieved deals from Pipedrive CRM.
    
    
    /**
     * @param int $limit Items shown per page (how many Deals retrieved per request, you can change this number)
     * @param string|null $cursor Pagination cursor for next page
     * @return array
     */
    
    function getDeals($limit = DEALS_PER_PAGE, $cursor = null) {
        echo "Getting Deals, limit: $limit" . ($cursor ? ", cursor: $cursor" : "") . PHP_EOL;
     
        // Here's the URL you're sending this request to
        $url = 'https://' . COMPANY_DOMAIN . '.pipedrive.com/api/v2/deals?api_token='
            . API_TOKEN . '&limit=' . $limit;
        
        // Add cursor parameter if provided
        if ($cursor !== null) {
            $url .= '&cursor=' . urlencode($cursor);
        }
     
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          
        echo 'Sending request...' . PHP_EOL;
          
        $output = curl_exec($ch);
        curl_close($ch);
          
        // Create an array from the data that is sent back from the API
        $result = json_decode($output, true);
        $deals = [];
     
        // Check if request was successful
        if (empty($result['success']) && !empty($result['error'])) {
            echo "API Error: " . $result['error'] . PHP_EOL;
            return $deals;
        }
     
        // If the result is not empty, then add each Deal into the Deals array
        if (!empty($result['data'])) {
            foreach ($result['data'] as $deal) {
                $deals[] = $deal;
            }
        } else {
            // If you have no Deals in your company, then print out the whole response
            print_r($result);
        }
     
        // Check if there are more items using cursor-based pagination
        if (!empty($result['additional_data']['pagination']['more_items_in_collection']) 
            && $result['additional_data']['pagination']['more_items_in_collection'] === true
            && !empty($result['additional_data']['pagination']['next_cursor'])
        ) {
            // Merges Deals found from the current request with the ones from the next request
            $deals = array_merge($deals, getDeals($limit, $result['additional_data']['pagination']['next_cursor']));
        }
        return $deals;
    }
     
    // Call the function
    $deals = getDeals();
     
    // Print out the number of Deals found
    echo 'Found '.count($deals).' deals' . PHP_EOL;
     
    // Iterate over all found Deals
    foreach ($deals as $key => $deal) {
        // Print out a Deal title with its ID
        echo '#' . ($key + 1) . ' ' .  $deal['title'] . ' ' . '(Deal ID:'. $deal['id'] . ')' . PHP_EOL;  
    }
    

## 4\. Print the results

Print out the number of Deals found and iterate over all of them. Then continue printing out the Deal title with its ID:
    
    
    // Print out the number of Deals found
    echo 'Found '.count($deals).' deals' . PHP_EOL;
     
    // Iterate over all found Deals
    foreach ($deals as $key => $deal) {
        // Print out a deal title with its ID
        echo '#' . ($key + 1) . ' ' .  $deal['title'] . ' ' . '(Deal ID:'. $deal['id'] . ')' . PHP_EOL;  
    }

## 5\. Full working example in PHP

Copy the full working example into getAllDealTitles.php:
    
    
    <?php
    // Content of getAllDealTitles.php
      
    // Insert your Pipedrive API token
    const API_TOKEN = 'YOUR_API_TOKEN';
     
    // Insert your Pipedrive company domain
    const COMPANY_DOMAIN = 'YOUR_COMPANY_DOMAIN';
     
    // Insert number of Deals per page you want to retrieve (cannot exceed 500 due to the pagination limit)
    const DEALS_PER_PAGE = 10;
     
    
    /**
     * @param int $limit Items shown per page (how many Deals retrieved per request, you can change this number)
     * @param string|null $cursor Pagination cursor for next page
     * @return array
     */
    
    function getDeals($limit = DEALS_PER_PAGE, $cursor = null) {
        echo "Getting Deals, limit: $limit" . ($cursor ? ", cursor: $cursor" : "") . PHP_EOL;
     
        // Here's the URL you're sending this request to
        $url = 'https://' . COMPANY_DOMAIN . '.pipedrive.com/api/v2/deals?api_token='
            . API_TOKEN . '&limit=' . $limit;
        
        // Add cursor parameter if provided
        if ($cursor !== null) {
            $url .= '&cursor=' . urlencode($cursor);
        }
     
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          
        echo 'Sending request...' . PHP_EOL;
          
        $output = curl_exec($ch);
        curl_close($ch);
          
        // Create an array from the data that is sent back from the API
        $result = json_decode($output, true);
        $deals = [];
     
        // Check if request was successful
        if (empty($result['success']) && !empty($result['error'])) {
            echo "API Error: " . $result['error'] . PHP_EOL;
            return $deals;
        }
     
        // If the result is not empty, then add each Deal into the Deals array
        if (!empty($result['data'])) {
            foreach ($result['data'] as $deal) {
                $deals[] = $deal;
            }
        } else {
            // If you have no Deals in your company, then print out the whole response
            print_r($result);
        }
     
        // Check if there are more items using cursor-based pagination
        if (!empty($result['additional_data']['pagination']['more_items_in_collection']) 
            && $result['additional_data']['pagination']['more_items_in_collection'] === true
            && !empty($result['additional_data']['pagination']['next_cursor'])
        ) {
            // Merges Deals found from the current request with the ones from the next request
            $deals = array_merge($deals, getDeals($limit, $result['additional_data']['pagination']['next_cursor']));
        }
        return $deals;
    }
     
    // Call the function
    $deals = getDeals();
     
    // Print out the number of Deals found
    echo 'Found '.count($deals).' deals' . PHP_EOL;
     
    // Iterate over all found Deals
    foreach ($deals as $key => $deal) {
        // Print out a Deal title with its ID
        echo '#' . ($key + 1) . ' ' .  $deal['title'] . ' ' . '(Deal ID:'. $deal['id'] . ')' . PHP_EOL;  
    }
    

## 6\. Full working example in Node.js

The Node.js code equivalent is as follows:
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration, DealsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function getDealsWithPagination() {
      try {
        console.log('Sending request...');
    
        const dealsApi = new DealsApi(apiConfig);
    
        // Uses cursor-based pagination
        const data = {
          limit: 3, // Items shown per page (how many Deals retrieved per request)
          // For first page, don't include cursor. For subsequent pages, include the cursor from the previous response
        };
    
        const response = await dealsApi.getDeals(data);
    
        console.log(
          'Got deals with pagination successfully! (cursor-based)',
          response
        );
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Getting deals with pagination failed', errorToLog);
      }
    }
    
    getDealsWithPagination();

## 7\. Execute the code

Use php getAllDealTitles.php command to execute the code in the command line.

In my example below, I have 21 Deals, and this is the output I get:
    
    
    $ php getAllDealTitles.php
    Getting deals, limit: 10, start: 0
    Sending request...
    Getting deals, limit: 10, start: 10
    Sending request...
    Getting deals, limit: 10, start: 20
    Found 21 deals with titles:
    #1 Batman deal (Deal ID:134)
    #2 Big apple sale (Deal ID:135)
    #3 Robin sale (Deal ID:136)
    #4 Silly goose (Deal ID:137)
    #5 Mademoiselle sale (Deal ID:138)
    #6 Cats and dogs (Deal ID:139)
    #7 Panna on vaja (Deal ID:140)
    #8 Lucky (Deal ID:141)
    #9 Call him now (Deal ID:142)
    #10 Sending (Deal ID:143)
    #11 Wolt (Deal ID:144)
    #12 PD (Deal ID:145)
    #13 The Explorer (Deal ID:146)
    #14 The Carryall (Deal ID:147)
    #15 The Pineapple (Deal ID:148)
    #16 The Base (Deal ID:149)
    #17 Kisser (Deal ID:150)
    #18 Hugger (Deal ID:151)
    #19 The Scholar (Deal ID:152)
    #20 The Artist (Deal ID:153)
    #21 The Ace (Deal ID:154)
    

Next 
