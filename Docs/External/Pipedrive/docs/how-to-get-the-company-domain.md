# How to get the company domain

[ __Suggest Edits](/edit/how-to-get-the-company-domain)

There are a few methods for getting the value of the subdomain for a Pipedrive company for which we use the `company_domain` parameter: 

  * [Finding it manually](/docs/how-to-get-the-company-domain#method-1)
  * [Request to `GET /users/me` endpoint](/docs/how-to-get-the-company-domain#method-2)
  * [Request to the OAuth server](/docs/how-to-get-the-company-domain#method-3)

  


* * *

## 

Method 1

[](#method-1)

* * *

You can get it manually from the Pipedrive app by logging into your Developer Sandbox account and seeing the URL:

![1480](https://files.readme.io/8910671-Company_domain.png)   


* * *

## 

Method 2

[](#method-2)

* * *

You can fetch it via [`GET /users/me`](https://developers.pipedrive.com/docs/api/v1/Users#getCurrentUser). Just **copy the code** below to your favorite editor and don't forget to replace the text with your actual API token. Execute the code and get the `company_domain` from the output:

PHP
    
    
    <?php
    
    $api_token = 'Your API token';
    $url = 'https://api.pipedrive.com/v1/users/me?api_token=' . $api_token;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    echo 'Sending request...' . PHP_EOL;
    
    $output = curl_exec($ch);
    curl_close($ch);
    
    $result = json_decode($output, true);
    
    if (!empty($result['data']['company_domain'])) {
      echo 'User company_domain is: ' . $result['data']['company_domain'] . PHP_EOL;
    }
    

You can check the [`GET /users/me`](https://developers.pipedrive.com/docs/api/v1/Users#getCurrentUser) response JSON [here](/docs/marketplace-getting-user-data).

  


* * *

## 

Method 3

[](#method-3)

* * *

If you’re using [OAuth authorization](/docs/marketplace-oauth-authorization) you can get the `company_domain` in the OAuth server's response when making a HTTP request to it. In the JSON response body, `company_domain` will be a part of the `api_domain` parameter's value.

More info can be found about it in the [getting the OAuth tokens](/docs/marketplace-oauth-authorization#step-4-and-step-5-getting-the-tokens) and [refreshing the OAuth tokens](/docs/marketplace-oauth-authorization#step-7-refreshing-the-tokens) sections.  
  


__Updated 7 months ago

* * *

Read next

  * [How to find the API token](/docs/how-to-find-the-api-token)
  * [About the Pipedrive API](/docs/core-api-concepts-about-pipedrive-api)
  * [Requests](/docs/core-api-concepts-requests)
  * [OAuth 2.0 overview](/docs/marketplace-oauth-api)


