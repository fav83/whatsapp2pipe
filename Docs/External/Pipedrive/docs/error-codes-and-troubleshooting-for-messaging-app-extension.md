# Error codes and troubleshooting

[ __Suggest Edits](/edit/error-codes-and-troubleshooting-for-messaging-app-extension)

We developed [the messaging app extension](/docs/messaging-app-extension) while keeping in mind ways of providing a great user experience between Pipedrive’s UI and the application service. Therefore, the app can take advantage of some predefined error messages that Pipedrive’s UI can display for the app.

* * *

## 

Expected error codes for the messaging extension's endpoints

[](#expected-error-codes-for-the-messaging-extensions-endpoints)

* * *

In the following table, you can see errors coming from the [manifest’s endpoints](/docs/implementing-messaging-app-extension) that are expected and handled by Pipedrive’s API in a user-friendly manner. 

Status| Payload example  
---|---  
**400 - Bad request**  
  
Expected for validation errors for debugging purposes.| `{ "success":false, "data":{ "message":"string", "code":"INVALID_BODY" } }`  
**401 - Unauthorized**  
  
It is expected when the user’s token is revoked or when they no longer have access to a resource.| `{ "success":false, "data":{ "message":"string", "code":"UNAUTHORIZED" } }`  
**401 - Unauthorized**  
  
Allows Pipedrive to display messages and appropriate UI to the user informing them about their account being suspended.  
Error code value ACCOUNT_SUSPENDED must be included.| `{ "success":false, "data":{ "message":"string", "code":"ACCOUNT_SUSPENDED" } }`  
**404 - Not found**  
  
A resource, e.g., a channel, was not found for the provided ID.| `{ "success":false, "data":{ "message":"string", "code":"NOT_FOUND" } }`  
**429 - Rate limit exceeded**  
  
The rate limit was exceeded, and the user can’t use the provider’s services for a period of time.| `{ "success":false, "data":{ "message":"string", "code":"RATE_LIMIT_EXCEEDED" "retry_by": "2021-11-26T13:42:17.191Z" } }`  
**403 - Forbidden**  
  
The resource the user tried to access doesn't belong to them. We suggest using this for debugging purposes.| `{ "success":false, "data":{ "message":"string", "code":"FORBIDDEN" } }`  
  
## 

Troubleshooting

[](#troubleshooting)

As we are working on the Messaging inbox and the app extension for it, your integration may face some issues. Here are some cases to keep in mind when developing:

  * If there are any problems with manifest endpoints, check out[ this `.yaml` file](https://github.com/pipedrive/omnichannel-api-docs/blob/master/omnichannel-integration.specs.yaml) which covers all manifest endpoints with their expected structures and limitations.

  * Currently, the messaging extension only supports conversations between 2 senders/participants. Group conversations with three or more people will not work. 

  * In the chat window, some icons are used to identify **the chat type** of a conversation, according to the `provider_type` field sent when you register a channel. Only **WhatsApp** and **Facebook Messenger** have specific icons. If you are working on a new kind of integration, please get in touch with us at [[email protected]](/cdn-cgi/l/email-protection#b9d4d8cbd2dccdc9d5d8dadc97dddccfcaf9c9d0c9dcddcbd0cfdc97dad6d4) and let us know, so we can work on including other types of icons. 

  * Please note that even though a generated “id” is returned when you register a channel, the channel ID expected by endpoints in the API always refers to the original ID you provided (`provider_channel_id` in the `POST /channels` payload). If you are receiving a `404` status while sending a request to one of the public endpoints, please verify if you are using the correct ID. This is true for all other objects in Channels API; the public endpoints will communicate externally using the IDs you provided.




__Updated 7 months ago

* * *

Read next

  * [Messaging app extension](/docs/messaging-app-extension)
  * [Implementing Messaging app extension](/docs/implementing-messaging-app-extension)


