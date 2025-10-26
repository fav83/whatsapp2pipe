# Video calling app extension

[ __Suggest Edits](/edit/video-calling-app-extension)

> ##  🚧
> 
> This is a BETA feature!
> 
> For more info, help, and feedback, please feel free to contact us at [[email protected]](/cdn-cgi/l/email-protection#d3beb2a1b8b6a7a3bfb2b0b6fdb7b6a5a093a3baa3b6b7a1baa5b6fdb0bcbe).

* * *

## 

Video calling access point inside Pipedrive

[](#video-calling-access-point-inside-pipedrive)

* * *

The video calling app extension gives app users the option to create, manage, and join video calls and meetings directly in Pipedrive’s activities.

![2268](https://files.readme.io/1a2160f-Screenshot_2020-09-03_at_16.10.44.png)

Users can add/generate links for video calls by using video calling apps

Once the user has added a video call to an activity, additional information can be displayed with the video call link e.g. the duration and/or invitation information of the video call. 

![2386](https://files.readme.io/95a0a8f-Screenshot_2020-09-03_at_16.13.59.png)

The fields Pipedrive fetches from video calling endpoints mapped in the manifest

Afterward, the information connected to the video call will then be displayed together with the activity throughout Pipedrive, e.g., in the contacts list, calendar view, deal detail view. 

![2276](https://files.readme.io/b74c941-Screenshot_2020-09-03_at_16.15.33.png)

When an activity has been saved with the video calling app extension, a button will appear in the deal details view to join the call. Once clicked, the button redirects to the video call URL.

  


* * *

## 

Development process

[](#development-process)

* * *

To extend your app’s capabilities to the activities modal, we’ve built the logic of reverse APIs, where Pipedrive will request information from a third-party video calling service’s API. These requests will be made to the endpoints that are defined in a [manifest](/docs/app-extensions-invoicing#manifest-for-invoicing-app-extension) uploaded to the [Developer Hub](/docs/marketplace-registering-the-app#app-extensions) by the app creator.

  * To begin, you’ll need access to the [Developer Hub](https://app.pipedrive.com/developer-hub), where your app is maintained
  * In Developer Hub, click on your app’s name and go to the OAuth & access scopes tab
  * Select the **video calls integration** scope**
  * Make sure that your app is connected to Pipedrive or a third-party service (if the app acts as an intermediary) and has finalized the connection. When a user has installed your app, the app will call the `POST /userProviderLink` endpoint and send the user information to Pipedrive.
  * Following this, get acquainted with what should be added to the [manifest](/docs/video-calling-app-extension#manifest-for-video-calling-app-extension), **create** the manifest for your app, and **add** it to your app’s listing in Developer Hub
  * Finish up your app and submit it for [the app approval process](/docs/marketplace-app-approval-process)

  


* * *

## 

Connecting the app

[](#connecting-the-app)

* * *

### 

Connecting your app to Pipedrive

[](#connecting-your-app-to-pipedrive)

The application is installed by clicking “install” within the Pipedrive Marketplace. Once the user has agreed to the [scopes](/docs/marketplace-scopes-and-permissions-explanations), the browser gets redirected to the app's registered `callback URL` ([step 3 of OAuth authorization](/docs/marketplace-oauth-authorization#step-3-callback-to-your-app)). At this moment, the app needs to fetch and permanently store the OAuth tokens it receives from Pipedrive ([step 4 of the OAuth authorization](/docs/marketplace-oauth-authorization#step-4-and-step-5-getting-the-tokens)). For video calling apps, we require generating a unique identifier string (e.g., a `UUID`) for each connection/link, which Pipedrive will use for all API calls executed against the app.

### 

Finalizing the connection

[](#finalizing-the-connection)

After the unique identifier has been generated and the OAuth tokens stored, the app must register itself as a data provider by calling the `POST /userProviderLink` endpoint. To finalize everything, the app should redirect the user to the `redirectUrl` that was received as the response for the registration call against the Pipedrive API. On that page, the user will see if both the installation and connecting process succeeded and can then configure their preferences.

### 

POST /userProviderLink

[](#post-userproviderlink)

A video calling provider must call this endpoint after a user has installed the video calling app so that the new user's information is sent.

**URL**

URL
    
    
    https://{COMPANYDOMAIN}.pipedrive.com/api/v1/meetings/userProviderLink
    

**A sample request structure made by the video calling app:**

JSON
    
    
    {
      user_provider_id: 'string',
      user_id: 001,
      company_id: 007,
      marketplace_client_id: 'string',
    }
    

Name| Type| Required/optional| Description  
---|---|---|---  
`user_provider_id`| string, UUID| Required| A unique `user_provider_id` that has to be in `UUID` format  
`user_id`| number| Required| Pipedrive user ID of the user that installed the integration  
`company_id`| number| Required| Pipedrive company ID of the user that installed the integration  
`marketplace_client_id`| string| Required| Pipedrive Marketplace client ID of the installed app  
  
**Sample of response structure:**

Status: 200

JSON
    
    
    {
      success: true,
      data: {
        message: 'The user was added successfully'
      }
    }
    

  


* * *

## 

Manifest for video calling app extension

[](#manifest-for-video-calling-app-extension)

* * *

A manifest describes, in a special contract format, the endpoints to which Pipedrive’s API will request. Based on the responses of those requests, the data received will be displayed inside Pipedrive UI in a pre-defined format. For the video calling app extension, the data received from the endpoints will be displayed in the activity modal.

The manifest for your app will need the appropriate URLs of a video calling service’s API endpoints. Once the manifest for your video calling app is submitted to Developer Hub, it will be validated against a pre-defined schema.

### 

Template for video calling manifest

[](#template-for-video-calling-manifest)

The file below defines the JSON schema of the manifest for an app that wants to display its contents inside the Pipedrive activities modal.

For your app’s manifest, just **add your own value** for `clientID` and corresponding URLs of a video calling service’s API requests to `endpoints`.

JSON
    
    
    {
    	"version": "v202049",
    	"clientId": "dummyclientid123",
    	"endpoints": {
    		"postMeeting": "https://example.com/api/:linkId/",
    		"deleteMeeting": "https://example.com/api/:linkId/meetings/:meetingId",
    		"patchUpdateMeeting": "https://example.com/:linkId/meetings/:meetingId"
    	}
    }
    

### 

Manifest URL format

[](#manifest-url-format)

`:linkId` must be included in all endpoints' URLs. `:linkId` will be replaced with the unique identifier that the vendor registers the connection with. The unique identifier represents the connection between the app and the user. 

`:meetingId` must be included in `deleteMeeting` and `patchUpdateMeeting` endpoint’s URLs. The `:meetingId` will be replaced with a unique meeting ID provided by the `postMeeting` endpoint by the provider.

### 

Explanation of the manifest

[](#explanation-of-the-manifest)

Object| Explanation| Required/optional  
---|---|---  
`”version”`| Defines the version of the manifest. Currently, the only supported version is `"v202049"`.| required  
`"clientId"`| Your app's client ID. You can get it from the [OAuth & access scopes](marketplace-registering-the-app#oauth--access-scopes) tab in [Developer Hub](https://app.pipedrive.com/developer-hub).| required  
`"endpoints"`| Defines a set of video calling service’s endpoints' URLs to where Pipedrive will make requests to| required  
`"postMeeting"`| See [postMeeting](/docs/video-calling-app-extension#post-postmeeting-endpoint)| required  
`"deleteMeeting"`| See [deleteMeeting](/docs/video-calling-app-extension#patch-patchupdatemeeting-endpoint)| required  
`"patchUpdateMeeting"`| See [patchUpdateMeeting](/docs/video-calling-app-extension#patch-patchupdatemeeting-endpoint)| required  
  
  


* * *

## 

Video calling endpoints

[](#video-calling-endpoints)

* * *

### 

Authentication

[](#authentication)

All requests from Pipedrive to the app will be supplemented with an authentication header using the same `client ID` and `client secret` as the OAuth token exchange in [OAuth authorization](/docs/marketplace-oauth-authorization).  
E.g. `Authorization: Basic <base64(client_id:client_secret)>`

  


* * *

### 

POST "postMeeting" endpoint

[](#post-postmeeting-endpoint)

**required**

The `postMeeting` endpoint is used to create a video call meeting. It is called when the user starts adding a video call in the activity modal and can be done either in deal detail view or contacts view.

![1474](https://files.readme.io/a6e7a21-Screenshot_2020-09-03_at_16.16.35.png)

**The body of the request made to the`postMeetings` endpoint:**

JSON
    
    
    {
      topic: 'string',
      start_time: 'YYYY-MM-DD HH:mm',
      duration: 60
    }
    

Name| Type| Required/Optional| Description  
---|---|---|---  
`topic`| string| Required| The name of the activity  
`start_time`| string| Required| Start time of the meeting in UTC format `'YYYY-MM-DD HH:mm'`  
`duration`| number| Required| A positive number showing the length of the meeting in minutes  
  
**The expected response from the`postMeeting` endpoint:**

Status: 201

JSON
    
    
    {
      success: true,
      data: {
        meeting_id: 'string',
        join_url: 'string',
        password: 'string',
        invitation: 'string',
      }
    }
    

Name| Type| Required/Optional| Description  
---|---|---|---  
`meeting_id`| string| Required| A unique meeting ID. `meeting_id` will be used for deleting and updating the information about the video call  
`join_url`| string| Required| A URL to join the video call  
`password`| string| Optional| Password for the video call  
`invitation`| string| Required| Invitation and/or information about the video call meeting  
  
  


* * *

### 

PATCH "patchUpdateMeeting" endpoint

[](#patch-patchupdatemeeting-endpoint)

**Required**

The `patchUpdateMeeting` endpoint will be called when the name or time of the activity is updated.

**The body of the request made to the`patchUpdateMeeting` endpoint:**

JSON
    
    
    {
      topic: 'string',
      start_time: 'YYYY-MM-DD HH:mm',
      duration: 60
    }
    

Name| Type| Required/optional| Description  
---|---|---|---  
`topic`| string| Required| The name of the activity  
`start_time`| string| Required| Start time of the video call in UTC format `'YYYY-MM-DD HH:mm'`  
`duration`| number| Required| A positive number showing the length of the video call in minutes  
  
**The expected response from the`patchUpdateMeeting` endpoint:  
**  
Status: 204

JSON
    
    
    {
      success: true
    }
    

  


* * *

### 

DELETE “deleteMeeting” endpoint

[](#delete-deletemeeting-endpoint)

**Required**

The `deleteMeeting` endpoint will be called when the activity is deleted or the meeting link is deleted using the trashcan icon in the activity modal. 

![1362](https://files.readme.io/e743cbe-Screenshot_2020-09-03_at_16.27.07.png)

The body of the request made to the `deleteMeeting` endpoint will be empty. 

The `:meetingId` parameter in the provided `deleteMeeting` URL in the manifest file will be replaced with a unique meeting ID.

**The expected response from the`deleteMeeting` endpoint:**

Status: 204

JSON
    
    
    {
      success: true
    }
    

  


__Updated 7 months ago

* * *
