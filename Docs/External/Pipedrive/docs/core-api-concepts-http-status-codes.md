# HTTP status codes

[ __Suggest Edits](/edit/core-api-concepts-http-status-codes)

Here's a list of the **status codes** used in Pipedrive:

Status Code| Name| Description  
---|---|---  
`200`| OK| Request fulfilled  
`201`| Created| New resource created  
`400`| Bad Request| Request not understood  
`401`| Unauthorized| Invalid API token  
`402`| Payment Required| Company account is not open (possible reason: trial expired, payment details not entered)  
`403`| Forbidden| Request not allowed.  
User account has [reached a limit](https://support.pipedrive.com/en/article/usage-limits-in-pipedrive) for an entity.  
`404`| Not Found| Resource unavailable  
`405`| Method not allowed| Incorrect request method  
`410`| Gone| Old resource permanently unavailable  
`415`| Unsupported Media Type| Feature is not enabled  
`422`| Unprocessable Entity| Webhooks limit reached  
`429`| Too Many Requests| [Rate limit](/docs/core-api-concepts-rate-limiting) has been exceeded  
`500`| Internal Server Error| Generic server error  
`501`| Not Implemented| Non-existent functionality  
`503`| Service Unavailable| Scheduled maintenance  
  
 __Updated 7 months ago

* * *

Read next

  * [OAuth status codes](/docs/marketplace-oauth-and-api-proxy-status-codes)
  * [Authentication](/docs/core-api-concepts-authentication)


