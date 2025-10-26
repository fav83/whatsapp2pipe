# Migrating existing integration users

[ __Suggest Edits](/edit/marketplace-migrating-existing-integration-users)

If you are a partner with an existing API token integration, you may want to migrate your existing integration's users to a Marketplace app.

It's possible to exchange the API token to a pair of access and refresh tokens using a custom grant type. You must execute this HTTP request to the OAuth server:

URL
    
    
    POST https://oauth.pipedrive.com/oauth/token
    

In order to execute the request, your request **has** to be authenticated via HTTP Basic Auth with the values of `client_id` and `client_secret`.

Header parameter| Description  
---|---  
`Authorization`| Base 64 encoded string containing the `client_id` and `client_secret` values.  
Value should be `"Authorization: Basic <base64(client_id:client_secret)>"`.  
  
> ## 🚧
> 
> Note that authentication could also be done by providing values for `client_id` and `client_secret` in the request body, but it's not recommended. Use it only when you cannot use HTTP Basic Auth approach.

Body parameter| Description  
---|---  
`grant_type`| Since you are trying to exchange an API token to a pair of tokens, you must use value `"exchange_api_token"`.  
`api_token`| API token of the user  
  
> ## 🚧
> 
> Have in mind that each `api_token` can be exchanged only once, you have one chance for this operation. In case of problems, please contact [[email protected]](/cdn-cgi/l/email-protection#ef828e9d848a9b9f838e8c8ac18b8a999caf9f869f8a8b9d86998ac18c8082)

If all data is correct, you will receive a response with the JSON data:

JSON key name| Description  
---|---  
`access_token`| Access token you need to use for accessing user's data via API  
`token_type`| The format of the token. Always "bearer"  
`refresh_token`| Refresh token which is needed when you refresh `access_token`  
`scope`| List of scopes selected in the app's settings  
`expires_in`| TTL of access token in seconds. After this time token will become invalid and you have to refresh it  
`api_domain`| The base URL path, including the `company_domain`, where the requests can be sent to.  
  
When the exchange of the tokens was successful, all users who were previously using the API token integration, will receive an email notifying them about the following: 

  * the integration has now been updated to an OAuth app, 
  * the OAuth app has been installed to their company,
  * the user needs to confirm [the permissions](/docs/marketplace-scopes-and-permissions-explanations) the app has in their account before starting to use it.



The app will also appear in the user's _Settings > Tools and apps > Marketplace apps_ page.

> ## ❗️
> 
> Now you **should** delete the API token, because from this point on your app must only use OAuth authentication.

  


__Updated 7 months ago

* * *

Read next

  * [OAuth authorization](/docs/marketplace-oauth-authorization)
  * [App installation flows](/docs/app-installation-flows)
  * [Handling user app uninstallation](/docs/app-uninstallation)
  * [App approval process](/docs/marketplace-app-approval-process)


