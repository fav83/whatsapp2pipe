# Authentication

[ __Suggest Edits](/edit/core-api-concepts-authentication)

> ##  📘
> 
> All requests to our API need **authentication**.

## 

If you're creating an app

[](#if-youre-creating-an-app)

Continue to [OAuth 2.0 overview](/docs/marketplace-oauth-api).  
You can find our step-by-step guide to getting OAuth 2.0 implemented in your app in [OAuth authorization](/docs/marketplace-oauth-authorization) .

## 

If you're working with an API token integration

[](#if-youre-working-with-an-api-token-integration)

The API token must be provided in the `x-api-token` header for all requests, for example:

cURL
    
    
    curl --request GET \
    --url "https://companydomain.pipedrive.com/api/v1/deals" \
    --header "x-api-token: 659c9fddb16335e48cc67114694b52074e812e03"
    

[How to find the API token?](/docs/how-to-find-the-api-token)

> ## 📘
> 
> Keep in mind that an API token is tied to a specific user and company, giving access to all user's data. You can only have one active API token at any time. If you change the API token, all existing integrations using this API token will not be able to make successful requests against our API and stop working.

__Updated 7 months ago

* * *

Read next

  * [Custom fields](/docs/core-api-concepts-custom-fields)


