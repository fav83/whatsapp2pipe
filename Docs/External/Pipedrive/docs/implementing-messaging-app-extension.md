# Implementing messaging app extension

[ __Suggest Edits](/edit/implementing-messaging-app-extension)

This page will cover the technical aspects for adding and creating a manifest and the implementation flows for messaging app extension. For a general overview and development steps, see [messaging app extension](/docs/messaging-app-extension) page and for error codes [error codes and troubleshooting](/docs/error-codes-and-troubleshooting-for-messaging-app-extension) page.

## 

Manifest for messaging app extension

[](#manifest-for-messaging-app-extension)

* * *

A manifest describes, in a special contract format, the endpoints to which Pipedrive will make requests to. Based on the responses to those requests, the data received will be displayed inside Pipedrive UI in a pre-defined format. For the messaging app extension, the data received from the endpoints will be displayed in the Messaging inbox under integrations.

The manifest for your app will need the appropriate URLs of a messaging service’s API endpoints. Once the manifest for your messaging app is submitted to Developer Hub, it will be validated against a pre-defined schema. 

## 

Template for messaging manifest

[](#template-for-messaging-manifest)

The file below defines the manifest’s JSON schema and the endpoints that the app needs to expose to display the service’s contents inside Pipedrive’s Messaging inbox. All endpoints’ URLs contain the `provider_channel_id` value, which is the identifier the app gives Pipedrive. Pipedrive uses this ID to make requests to the integration, specifically to fetch data about channels.

JSON
    
    
    {
        "version": "v202101",
        "endpoints": {
            "getConversations": "https://example.com/api/channels/:providerChannelId/conversations",
            "getConversationById": "https://example.com/api/channels/:providerChannelId/conversations/:sourceConversationId",
            "postMessage": "https://example.com/api/channels/:providerChannelId/messages",
            "getSenderById": "https://example.com/api/channels/:providerChannelId/senders/:senderId",
            "deleteChannelById": "https://example.com/api/channels/:providerChannelId",
            "getTemplates": "https://example.com/api/channels/:providerChannelId/templates",
            "getMessageById": "https://example.com/api/channels/:providerChannelId/conversations/:sourceConversationId/messages/:sourceMessageId"
        }
    }
    

From this manifest, some endpoints are optional:

  * [`getSenderById` endpoint](/docs/implementing-messaging-app-extension#get-getsenderbyid-endpoint) is **optional** (needed only if `avatar_expires` or `fetch_avatar` is `true`)
  * [`deleteChannelById` endpoint](/docs/implementing-messaging-app-extension#delete-deletechannelbyid-endpoint) is **optional** (needed if **multiple channels per user** is supported, e.g., Facebook pages)
  * [`getTemplates` endpoint](/docs/implementing-messaging-app-extension#get-gettemplates-endpoint) is **optional** (needed only if `template_support` is **enabled**)
  * [`getMessageById` endpoint](/docs/implementing-messaging-app-extension#get-getmessagebyid-endpoint) is **optional** (needed only if `link_expires` is **enabled**)



> ## 📘
> 
> You can import [this .yaml file](https://github.com/pipedrive/omnichannel-api-docs/blob/master/omnichannel-integration.specs.yaml) to any API testing tool(e.g., <https://editor.swagger.io/>) to see exact structures and requirements for requests and responses of Manifest endpoints.

* * *

## 

Authentication of the request from Pipedrive

[](#authentication-of-the-request-from-pipedrive)

* * *

All requests from Pipedrive to the app will be supplemented with an authentication header that uses the same `client_id` and `client_secret` as the OAuth token exchange in [OAuth authorization](/docs/marketplace-oauth-authorization).  
E.g. `Authorization: Basic <base64(client_id:client_secret)>`

  


* * *

## 

Pagination cursors

[](#pagination-cursors)

* * *

Due to how popular business chat providers work, the Channels API uses a different type of pagination from the standard one used in Pipedrive'd public API. 

The pagination for the manifest works with cursors, which are references the application provides to our API, that are sent back to the app when a new page needs to be fetched. For example, in the endpoint [`getConversations`](/docs/implementing-messaging-app-extension#get-getconversations-endpoint), it’s expected by Pipedrive to receive a property `next_messages_cursor`, which we will store and send back when our API calls the [`getConversationById`](implementing-messaging-app-extension#get-getconversationbyid-endpoint) endpoint (after query parameter). 

In the same [`getConversations`](/docs/implementing-messaging-app-extension#get-getconversations-endpoint) endpoint, inside the `additional_data` object, the application will send the `after` property to our API, which is a **cursor** that can be used to fetch more conversations in the same endpoint (after query parameter).

  


* * *

## 

Implementation flows

[](#implementation-flows)

* * *

## 

Installation flow

[](#installation-flow)

The installation is considered complete when the app is installed via OAuth 2.0 and at least one channel is registered for the installation. The installation process will call the following manifest endpoints during the process:

Manifest endpoint| Required to implement?  
---|---  
[`getConversations`](/docs/implementing-messaging-app-extension#get-getconversations-endpoint)| Yes  
[`getTemplates`](/docs/implementing-messaging-app-extension#get-gettemplates-endpoint)| Yes, if the channel was registered with the option `template_support` as `true`  
[`getSenderById`](/docs/implementing-messaging-app-extension#get-setsenderbyid-endpoint)| Yes, if a sender was returned in a conversation for the `getConversations` request, with the `fetch_avatar ` flag set as `true`  
  
Channels API endpoint| Usage required?  
---|---  
`POST /channels`| The app needs to register a channel in order to use the extension  
  
  
![818](https://files.readme.io/df99e0b-Installation_flow_-_messaging_app_extension.png)   


## 

Sending a message flow

[](#sending-a-message-flow)

The user can send and receive messages by using a channel. These messages may contain attachments. When a user sends a message, Pipedrive will call the following manifest endpoint:

Manifest endpoint| Required to implement?  
---|---  
[`postMessage`](/docs/implementing-messaging-app-extension#post-postmessage-endpoint)| Yes  
  
The public endpoint to receive new messages will update a message if it already exists in the API. 

Channels API endpoint| Required to implement?  
---|---  
`POST /channels/messages/receive`| Yes  
  
  
![741](https://files.readme.io/bb62102-Messaging_app_extesnion_-_sending_a_message.png)   


## 

Receiving a message flow

[](#receiving-a-message-flow)

When a channel receives a new message, be it to start a new conversation or to add it to an existing one, that message should be sent to Channels API. When it’s a message related to a new conversation, our API will request more detailed data about the conversation by making a request to the manifest endpoint `getConversationById`.

Manifest endpoint| Required to implement?  
---|---  
[`getConversationById`](/docs/implementing-messaging-app-extension#get-getconversationbyid-endpoint)| If the message received does not have a conversation in the API, Channels API will request more details about the conversation with the specified `conversation_id`  
  
Channels API endpoint| Required to implement?  
---|---  
`POST /channels/messages/receive`| When a message from the end-user is received, use this endpoint to register it  
  
  


![](https://files.readme.io/fe167f6-Screenshot_2022-04-27_at_16.47.38.png)

  


## 

Handling expiring links flow

[](#handling-expiring-links-flow)

### 

Handling expiring attachments

[](#handling-expiring-attachments)

When an attachment was registered with the option `link_expires` `true`, Pipedrive will test the attachment links provided, by sending a [HEAD](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD) request. In the case that the link is no longer accessible, Pipedrive will make a request to the following manifest endpoint:

Manifest endpoint| Required to implement?  
---|---  
[`getMessageById`](/docs/implementing-messaging-app-extension#get-getmessagebyid-endpoint)| If the attachment was registered with the option `link_expires`, this endpoint should be available  
  
  


![](https://files.readme.io/c22311e-Screenshot_2022-04-27_at_16.47.12.png)

### 

Handling expiring avatars

[](#handling-expiring-avatars)

When a sender was registered with the option `avatar_expires`, Pipedrive will test the avatar link provided by sending a `HEAD` request (not more often than once per day). If the link is no longer accessible, Pipedrive will request the following manifest endpoint:

Manifest endpoint| Required to implement?  
---|---  
[`getSenderById`](/docs/implementing-messaging-app-extension#get-getsenderbyid-endpoint)| If the sender was registered with the option `avatar_expires`, this endpoint should be available  
  
The rest of the update flow will go similarly to the attachment links.

  


* * *

  


## 

Messaging endpoints for manifest

[](#messaging-endpoints-for-manifest)

  


* * *

## 

GET "getConversations" endpoint

[](#get-getconversations-endpoint)

* * *

**Required**

The `getConversations` endpoint is used to sync an initial batch of conversations and their messages. It is called right after a channel is registered in the Channels API using the `POST /channels` endpoint in the Pipedrive API.

The **path parameters** sent in the `getConversations` endpoint:

Name| Type| Required/Optional| Description  
---|---|---|---  
`providerChannelId`| string| Required in the manifet's path description| A unique `providerChannelId` that identifies the channel  
  
The **query parameters** sent in the `getConversations` endpoint:

Name| Type| Description  
---|---|---  
`conversations_limit`| integer| The maximum number of conversations expected in the response  
`messages_limit`| integer| The maximum number of messages expected for each conversation in the response  
`after`| string| A cursor that will be used to fetch more conversations  
  
Expected **response** from the `getConversations` endpoint:

JSON
    
    
    {
      "success": true,
      "data": [
        {
          "id": "string",
          "link": "string",
          "status": "open",
          "seen": true,
          "next_messages_cursor": "string",
          "messages": [
            {
              "id": "string",
              "status": "sent",
              "created_at": "2022-03-29T06:38:06.913Z",
              "message": "string",
              "sender_id": "string",
              "reply_by": "2022-03-29T06:38:06.913Z",
              "attachments": [
                {
                  "id": "string",
                  "type": "string",
                  "name": "string",
                  "size": 0,
                  "url": "string",
                  "preview_url": "string"
                }
              ]
            }
          ],
          "participants": [
            {
              "id": "string",
              "name": "string",
              "role": "end_user",
              "avatar_url": "string"
            },
            {
              "id": "string",
              "name": "string",
              "role": "source_user",
              "avatar_url": "string"
            }
          ],
      "additional_data": {
        "after": "string"
      }
    }
    

* * *

## 

GET "getConversationById" endpoint

[](#get-getconversationbyid-endpoint)

* * *

**Required**

The `getConversationById` endpoint is used to fetch a specific conversation and its messages. It is called when an incoming message is part of a new conversation and when paginating over messages.

The **path parameters** sent in the `getConversationById` endpoint:

Name| Type| Required/Optional| Description  
---|---|---|---  
`providerChannelId`| string| Required in the manifest's path description| A unique `providerChannelId` that identifies the channel  
`sourceConversationId`| string| Required in the manifest's path description| The ID of the conversation, as in the field `conversation_id` on its messages  
  
The **query parameters** sent in the `getConversationById` endpoint:

Name| Type| Description  
---|---|---  
`after`| string| The cursors used for fetching more messages from the provider  
`messages_limit`| integer| The maximum number of messages expected for each conversation in the response.  
  
It's recommended to use the default value (30) and support pagination, for better performance.  
  
Expected **response** from the `getConversationById` endpoint:

JSON
    
    
    {
      "success": true,
      "data": {
        "id": "string",
        "link": "string",
        "status": "open",
        "seen": true,
        "next_messages_cursor": "string",
        "messages": [
          {
            "id": "string",
            "status": "sent",
            "created_at": "2022-03-29T06:39:23.251Z",
            "message": "string",
            "sender_id": "string",
            "reply_by": "2022-03-29T06:39:23.251Z",
            "attachments": [
              {
                "id": "string",
                "type": "string",
                "name": "string",
                "size": 0,
                "url": "string",
                "preview_url": "string"
              }
            ]
          }
        ],
        "participants": [
            {
              "id": "string",
              "name": "string",
              "role": "end_user",
              "avatar_url": "string"
            },
            {
              "id": "string",
              "name": "string",
              "role": "source_user",
              "avatar_url": "string"
            }
          ],
      "additional_data": {
        "after": "string"
      }
    }
    

* * *

## 

POST "postMessage" endpoint

[](#post-postmessage-endpoint)

* * *

**Required**

The `postMessage` endpoint is used to send a new message to a conversation. It’s called when a user types a message in the chat window and sends it. The endpoint supports messages with file attachments.

**The Content-Type header**

Unlike the other endpoints,**requests for this one will be sent as`multipart/form-data`**, since messages may include **file attachments**.

The **path parameters** sent in the `postMessage` endpoint:

Name| Type| Required/optional| Description  
---|---|---|---  
`providerChannelId`| string| Required in the manifest's path description| A unique `providerChannelId` that identifies the channel  
  
The **body** of the **request** made to the `postMessage` endpoint has the following **form fields** :

Name| Type| Description  
---|---|---  
`message`| string| The name of the activity  
`senderId`| string| The ID of the user who sent the message  
`conversationId`| string| The ID of the conversation  
`recipientIds[]`| string| Ids of all recipients for a message, split by ",". E.g., josef123456,Eva879542  
`files`| binaries| A list of binary files. All files sent with the message in `multipart/form-data` format (with `filename` and `contentType`).  
  
Expected **response** from the `postMessage` endpoint:

JSON
    
    
    {
      "success": true,
      "data": {
        "id": "string"
      }
    }
    

  


* * *

## 

GET "getSenderById" endpoint

[](#get-getsenderbyid-endpoint)

* * *

**Optional**

Inside the Messaging inbox, messages are displayed with their senders. This endpoint is used to fetch additional and up-to-date information about a sender every time a conversation is updated and available in the service/application.  
This endpoint is called occasionally (max once per day) to refresh the sender's avatar if `avatar_expires` is `true` and also when there is no avatar for the sender but `fetch_avatar` is set to `true` during the sender creation (only once when installing the app).

The **path parameters** sent in the `getSenderById` endpoint:

Name| Type| Required/Optional| Description  
---|---|---|---  
`providerChannelId`| string| Required| A unique `providerChannelId` that identifies the channel  
`senderId`| string| Required| The `senderId` as specified in the messages  
  
Expected **response** from the `getSenderById` endpoint:

JSON
    
    
    {
      "success": true,
      "data": {
        "id": "string",
        "name": "string",
        "avatar_url": "string"
      }
    }
    

  


* * *

## 

DELETE "deleteChannelById" endpoint

[](#delete-deletechannelbyid-endpoint)

* * *

**Optional**

In some messaging providers (e.g., Facebook Business with various pages), support for multiple channels is provided in the same account. The messaging app extension provides a way to delete channels from the messaging services with this endpoint. 

The **path parameters** sent in the `deleteChannelById` endpoint:

Name| Type| Required/optional| Description  
---|---|---|---  
`providerChannelId`| string| Required in the manifest path description| A unique `providerChannelId` that identifies the channel  
  
Expected **response** from the `deleteChannelById` endpoint:

JSON
    
    
    {
      "success": true,
    }
    

  


* * *

## 

GET "getTemplates" endpoint

[](#get-gettemplates-endpoint)

* * *

**Optional**

The `getTemplates` endpoint is used to fetch a list of templates, when available in the provider's service. Right now, only approved [WhatsApp templates](https://developers.facebook.com/docs/whatsapp/message-templates/creation) are supported.

![1546](https://files.readme.io/3845d8f-templates.png)

WhatsApp templates synced to Messaging inbox

The **path parameter** sent in the `getTemplates` endpoint:

Name| Type| Required/Optional| Description  
---|---|---|---  
`providerChannelId`| string| Required in the manifest's path description| A unique `providerChannelId` that identifies the channel  
  
Expected **response** from the `getTemplates` endpoint:

JSON
    
    
    {
      "success": true,
      "data": {
        "templates": [
          {
            "id": "string",
            "name": "string",
            "content": "string",
            "language": "string"
          }
        ]
      }
    }
    

  


* * *

## 

GET "getMessageById" endpoint

[](#get-getmessagebyid-endpoint)

* * *

**Optional**

The `getMessageById` endpoint is used to get updated messages with attachments. It is used for refreshing an expired attachment's URL when `link_expires` is set `true`.

The **path parameters** sent in the `getMessageById` endpoint:

Name| Type| Required/Optional| Description  
---|---|---|---  
`providerChannelId`| string| Required in the manifest's path description| A unique `providerChannelId` that identifies the channel  
`sourceMessageId`| string| Required in the manifest's path description| The message ID as specified in the message  
  
Expected **response** from the `getMessageById` endpoint:

JSON
    
    
    {
      "id": "string",
      "status": "sent",
      "created_at": "2022-03-29T06:51:33.727Z",
      "message": "string",
      "sender_id": "string",
      "reply_by": "2022-03-29T06:51:33.727Z",
      "attachments": [
        {
          "id": "string",
          "type": "string",
          "name": "string",
          "size": 0,
          "url": "string",
          "preview_url": "string"
        }
      ]
    }
    

  


__Updated 7 months ago

* * *

Read next

  * [Error codes and troubleshooting](/docs/error-codes-and-troubleshooting-for-messaging-app-extension)
  * [Messaging app extension](/docs/messaging-app-extension)
  * [Visibility and development of app extensions](/docs/visibility-and-development-of-app-extensions)


