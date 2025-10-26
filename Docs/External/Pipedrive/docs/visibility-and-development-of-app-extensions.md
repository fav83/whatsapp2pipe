# Visibility and development of app extensions

[ __Suggest Edits](/edit/visibility-and-development-of-app-extensions)

## 

Shared visibility of app extensions

[](#shared-visibility-of-app-extensions)

* * *

> ## 📘
> 
> Shared visibility of app extensions is in the testing phase. It's currently available for [link actions](/docs/app-extensions-actions), [JSON panels](/docs/app-extensions-json-panels) and [custom panels](/docs/custom-ui-extensions-panels) **by request**.
> 
> Please get in touch with us at [[email protected]](/cdn-cgi/l/email-protection#036e6271686677736f6260662d6766757043736a736667716a75662d606c6e) if you would like shared visibility of app extensions for your app.

While all app extensions are always available to the user who installed the app, some extensions can be shared with other users within the same Pipedrive company.

![1334](https://files.readme.io/d531f19-App_extensions_visibility_2.0.png)

App extensions' visibility during the app installation process

Shareable app extensions are:

  * [Link actions](/docs/app-extensions-actions)
  * [JSON panels](/docs/app-extensions-json-panels)
  * [Custom panels](/docs/custom-ui-extensions-panels) (only the entry point is shared, users need to install the app to use the custom panel)



This means that data displayed by an app in link actions and/or a JSON panel will be visible only to the user who installed the app or to all users in the same company.

## 

When app extensions are shared

[](#when-app-extensions-are-shared)

> ## 📘
> 
> If app extensions have shared visibility, **non-admin users still need to install the app** to use any other functionalities besides link actions and/or JSON panels.

When app extensions are shared with the whole company, all users in that company will receive an email notifying them about access to the extensions. Users can also see the app extensions they can access when they go to _Settings > Tools and integrations > Marketplace apps_. 

![1884](https://files.readme.io/c57f881-Shared_app_extensions.png)

What a user sees in their "Marketplace apps" list when app extensions are shared with them

### 

Link actions

[](#link-actions)

[Link actions](/docs/app-extensions-actions) are visible to all users when the app is shared. This means users can view the link action in both list and detail view, and click on it.

### 

JSON panels

[](#json-panels)

[JSON panels](/docs/app-extensions-json-panels) are visible to all users when app is shared. This means users can view the content within the JSON panel. However, only users who have **installed** the app can interact with the panel.

### 

Custom panels

[](#custom-panels)

![Visibility of custom panels](https://files.readme.io/b733974-JSON_panel_-_shared_visibility.png)

When an app with [custom panels](/docs/custom-ui-extensions-panels) is shared, all users will see a message and installation button in the custom panel that prompts them to install the app. Users will **have to install** the app to view and interact with the content within the custom panel.

## 

How app extensions can be shared

[](#how-app-extensions-can-be-shared)

App extensions can be shared by **one company admin user at a time**. The admin user can choose the app extensions' visibility during the app installation process and later modify the visibility in _Tools and integrations > Marketplace Apps_.

![3132](https://files.readme.io/45a1c85-App_extensions_visibility_-_Tools_and_apps.png)

Modifying app extensions' visibility in "Marketplace apps"

As only **one admin user can own the sharing option** , other admins will not be able to share/unshare visibility unless the first admin stops sharing or is deactivated. If the admin who owns the sharing option for app extensions is deactivated or removed,

  * The app and its app extensions will become unshared automatically. This means that users who did not install the app themselves will be unable to view the app in their list of "Marketplace apps" or any app extensions.
  * An email will be sent to active admin users with a link to the app and instructions on how to re-share app extensions' visibility.  
  




* * *

## 

Visibility considerations when developing app extensions

[](#visibility-considerations-when-developing-app-extensions)

* * *

Shared visibility is an important aspect to consider when developing app extensions, especially JSON panels. It's crucial to consider the use cases your planned extension(s) can cover along with how information is displayed during both the testing and development phases. Here's a small list of considerations that should be covered when planning and developing app extensions:

### 

Use case planning

[](#use-case-planning)

Think about what kind of data from your app should be visible in Pipedrive for users who don’t have the app installed themselves. Should all company users see everything or should it depend on the user’s role in Pipedrive? 

For example, you can see [`isShared`](/docs/app-extensions-json-panels#how-does-a-json-panel-work) parameter's value in JSON panel requests to understand if the user who sees the JSON panel has installed the panel themselves or the visibility has been shared with them.

### 

Displaying the information

[](#displaying-the-information)

Consider if your app's functionality depends on whether or not a user has installed your app. Users who don't have your app installed should still be able to view Pipedrive's data or a notification to install the app while those who have the app installed should be able to interact with your app within Pipedrive.

### 

JSON panels' visibility

[](#json-panels-visibility)

To help you understand if the JSON panel has shared visibility, we'll send a `POST` request to the `callback URL`, which is set in your app listing page in Developer Hub, to notify whether the app has shared or private visibility. The body of the request consists of the company ID, user ID and the [`isShared`](/docs/app-extensions-json-panels#how-does-a-json-panel-work) parameter.

Sample of the request body
    
    
    { 
    	“company_id”:001 , 
    	“user_id”: 007 , 
    	“isShared”: false
    }
    

This request will be sent in the following cases:

  * when a user installs the app
  * when the admin user changes the visibility of your app's app extensions  
  




* * *

## 

Handling data after app extensions have been unshared

[](#handling-data-after-app-extensions-have-been-unshared)

* * *

Admin users can share and, subsequently, unshare the visibility of app extensions. When a user unshares app extensions in Pipedrive, the functionality on your side should also take this into account so that unauthorized users wouldn't see the data hosted in Pipedrive or perform actions in Pipedrive.

It's important to ensure that the sharing and unsharing of app extensions work correctly if you allow your users to log in to your app via Pipedrive (using us as the identity provider).

**Unsharing JSON panels**  
For improved security, you should return an error for [JSON panel requests](/docs/app-extensions-json-panels#how-does-a-json-panel-work) from such unauthorized users. This is the time when you can use the information from the `POST` request we send to your `Callback URL` to notify you of any changes in the sharing status, so you can quickly get the visibility status from the [`isShared`](/docs/app-extensions-json-panels#how-does-a-json-panel-work) parameter.

  


__Updated over 1 year ago

* * *

Read next

  * [Link actions](/docs/app-extensions-actions)
  * [JSON modals](/docs/app-extensions-json-modals)
  * [JSON panels](/docs/app-extensions-json-panels)
  * [Invoicing app extension](/docs/app-extensions-invoicing)
  * [Video calling app extension](/docs/video-calling-app-extension)
  * [Messaging app extension](/docs/messaging-app-extension)


