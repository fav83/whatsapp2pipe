# Requests

[ __Suggest Edits](/edit/core-api-concepts-requests)

> ##  📘
> 
> All requests to the Pipedrive API must be made over SSL (https, not http).

Pipedrive APIs use JSON in the requests bodies. To ensure a proper JSON-formatted request, provide `Content-Type: application/json` in your HTTP request headers. Our API supports UTF-8 for character encoding.

For API v1, the `POST` method also supports a form-encoded body, but you might run into issues with data types. [API v2](/docs/pipedrive-api-v2), however, only accepts JSON bodies for all requests. Our API uses the HTTP verbs for each action:

Method| Description  
---|---  
`GET`| Used for retrieving resources  
`POST`| Used for creating resources  
`PUT`| Used for replacing resources or collections  
`PATCH`| Used for updating some parts of a resource  
`DELETE`| Used for deleting resources  
  
  


* * *

## 

URL naming

[](#url-naming)

* * *

Our API uses a straightforward URL naming convention.

  * Each request must be made to the API endpoint `https://{COMPANYDOMAIN}.pipedrive.com/api/v2`, followed by the type of object in a plural form, for example, `https://{COMPANYDOMAIN}.pipedrive.com/api/v2/deals`
  * When one item is being asked, and such a method exists, the ID of the item must be appended to the URL, for example `https://{COMPANYDOMAIN}.pipedrive.com/api/v2/deals/2`
  * When asking for sub-objects of an object, append that to the ID of the master object, for example, `https://{COMPANYDOMAIN}.pipedrive.com/api/v2/deals/2/activities`



We advise everyone to use `{COMPANYDOMAIN}.pipedrive.com` for faster requests as it helps us to better determine which data center your request should go to.

  


* * *

## 

Field selector

[](#field-selector)

* * *

When asking for a collection/list of objects, you can pass in a field selector to indicate which fields you would like to fetch per each object. Most v1 endpoints in our [API reference](https://developers.pipedrive.com/docs/api/v1/) support this, but not all.

> ## 🚧
> 
> Support for field selectors has been removed from [API v2](/docs/pipedrive-api-v2).

The field selector is supported in requests done with OAuth and requests done with the `api_token`. For example, you may only want to fetch a deal's ID, title, value, and currency when asking the deals list – this can be done by using the following syntax:

URL
    
    
    GET https://{COMPANYDOMAIN}.pipedrive.com/api/v1/deals:(id,title,value,currency)
    

You can also see the field selector being used in our [updating custom fields' values](https://developers.pipedrive.com/tutorials/update-custom-field-pipedrive-api) tutorial.

__Updated 2 months ago

* * *

Read next

  * [Rate limiting](/docs/core-api-concepts-rate-limiting)
  * [OAuth authorization](/docs/marketplace-oauth-authorization)


