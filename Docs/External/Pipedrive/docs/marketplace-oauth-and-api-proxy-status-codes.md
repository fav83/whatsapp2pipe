# OAuth status codes

[ __Suggest Edits](/edit/marketplace-oauth-and-api-proxy-status-codes)

Learn about the Marketplace status codes for both [OAuth]() and [API request](/docs/marketplace-oauth-and-api-proxy-status-codes#api-request) to indicate the success or failure of your requests.

  


* * *

## 

OAuth

[](#oauth)

* * *

https://oauth.pipedrive.com 

Status Code| URL| Message| Description  
---|---|---|---  
`200` OK| **/oauth/token**| |  Example response:  
  
{  
  
"access_token": "ACCESS_TOKEN",  
"token_type": "Bearer",  
"expires_in": 3600,  
"refresh_token": "REFRESH_TOKEN",  
"scope": "..scopes..,base"  
}  
`400` Bad Request| **/oauth/token**|  Missing parameter: `grant_type`| Required parameter `grant_type` is not provided  
| | Unsupported grant type: `grant_type` is invalid| Provided parameter `grant_type` is not valid. Supported values: `authorization_code`, `refresh_token`, `exchange_api_token`  
| | Invalid grant: `authorization_code` is invalid| Provided value of `authorization_code` parameter is not valid or was already exchanged to ACCESS TOKEN  
| | Invalid grant: `authorization_code` has expired| More than 5 minutes passed after issue of provided `authorization_code` and it became invalid  
| | Invalid grant: `refresh_token` is invalid| Provided `refresh_token` is not valid for provided client credentials or it was already exchanged  
| | Invalid grant: `api_token` is invalid| Provided parameter `api_token` is not valid for any Pipedrive user  
| | Invalid client: cannot retrieve client credentials| Both or at least one of required parameters `client_id` or `client_secret` were not provided in the request  
| | Invalid client: client is invalid| Provided values of `client_id` or `client_secret` are not valid  
| | Invalid request: `redirect_uri` is not a valid URI| Required parameter `redirect_uri` is not provided or value is not a valid URI  
| | Invalid request: `redirect_uri` is invalid| Provided value of `redirect_uri` parameter doesn't match with value defined in Developer Hub  
| | Invalid request: content must be `application/x-www-form-urlencoded`| Request to OAuth should have Content-Type `application/x-www-form-urlencoded`  
| **/oauth/authorize**|  App cannot be installed for requested company| User tried to install app that was removed from the Marketplace or not visible for last active user company in Pipedrive  
`500`| ***** | Internal Server Error|   
`503`| **/oauth/authorize**|  Whoops! Something broke in our servers and we cannot serve you this page.| Company database of Pipedrive user is under maintenance  
  
  


* * *

## 

API request

[](#api-request)

* * *

<https://companydomain.pipedrive.com/api/v1/>

Status Code| Message| Description  
---|---|---  
`200` OK| |   
`201` Created| | Resource created  
`204` No Content| | No content _(purpose can be different for different resources)_  
`400` Bad Request| Invalid request: malformed authorization header| Provided value of access token in `Authorization` header doesn't follow format `Bearer ACCESS_TOKEN`  
|  _(An explanation of what went wrong, which can be different for different resources)_|  Request contains invalid or missing data. Mostly relevant for `POST` and `PUT` requests.  
`401` Unauthorized| Invalid token: `access_token` is invalid| Provided `access_token` in `Authorization` header is not valid  
`403` Forbidden| Scope and URL mismatch| Not allowed to access requested resource by application scope that is defined by owner  
`404` Not found| `%Resource` not found|   
`410` Gone| | Old resource permanently unavailable  
`422` Unprocessable Entity| | For example, when the webhooks limit is reached for a user or an app and it's forbidden to create a new one  
`429` Too Many Requests| Request over limit| API requests limit reached for a company  
`500`| Internal Server Error|   
  
  


__Updated 7 months ago

* * *

Read next

  * [HTTP status codes](/docs/core-api-concepts-http-status-codes)


