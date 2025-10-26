# Registering a private app

[ __Suggest Edits](/edit/marketplace-registering-a-private-app)

Private apps, aka internal apps, enable you to share your integration with any user/company in Pipedrive via a direct, unlisted installation link. To do so, you must fill out the parts of the app registration form that cover app creation and [make your private app live](/docs/marketplace-registering-a-private-app#how-to-share-your-private-app).

* * *

## 

How to find Developer Hub

[](#how-to-find-developer-hub)

* * *

First, go to _Settings_ by clicking on your profile name in the upper right corner of the top navigation bar. Find the company name of your sandbox account and choose _Developer Hub_ from the drop-down menu:

![2576](https://files.readme.io/6647eb9-How_to_find_Developer_Hub.png)

You must have a developer sandbox account for app creation to see Developer Hub.

  


* * *

## 

Register a new private app

[](#register-a-new-private-app)

* * *

> ## 🚧
> 
> NB: Do pick your app type carefully, as it cannot be changed later on Developer Hub.

To register a new app, click on the green “Create an app” button (or “+ Create an app” if you have existing apps) followed by “Create private app”. This is also where you’d see a list of your public and private apps if you have any.

![2560](https://files.readme.io/47ae3f1-Developer_Hub_-_create_an_app.png)   


* * *

## 

App registration form

[](#app-registration-form)

* * *

The app registration form for private apps contains three different tabs.

You can save your app anytime by clicking the green “Save” button and exiting the form by clicking the white “Close app settings” button. This will take you back to your Developer Hub dashboard.

Read on to find out how and what to fill in each tab.

### 

Basic info

[](#basic-info)

![Developer Hub > private apps - basic info](https://files.readme.io/0417bd8-Developer_Hub_-_Private_app_-_Basic_info.png)

This tab has two required fields – App name and OAuth Callback URL. Once you’ve filled this in, click the green “Save” button to save the form. You’ll then be brought to the second tab, “OAuth & access scopes”, where you’ll get your `client_id` and `client_secret` and the option to make your app live via the “Change to live” button.

Field| Description  
---|---  
App name (required)| Insert your app’s name by what it’s going to be recognized by in the Marketplace.  
  
_Example: Car Services App_  
Callback URL (required, one URL per app)| Insert a link where an authorization code will be sent if the user approves or declines the installation of your app. This link is also where we return the user after successful authentication. Technically, a callback URL is the same thing as an OAuth `redirect_uri`.  
  
It’s okay to insert a non-functioning URL when creating a new app as long as you can update this field with a proper URL after implementing the logic needed to accept user authorization in your code. Please keep in mind that we allow only one callback URL per app.  
  
_Example:<https://www.carservicesapp.com/API/v2/callback>_  
  
### 

OAuth & Access scopes

[](#oauth--access-scopes)

![Developer Hub > private apps - OAuth & access scopes](https://files.readme.io/a08a6fd-Developer_Hub_-_Private_app_-_OAuth__access_scopes.png)

Field| Description  
---|---  
Access scopes (required)| Using [scopes](/docs/marketplace-scopes-and-permissions-explanations), you can specify precisely what data access your application needs. Your selection will depend significantly on the endpoints you use in your app. You can also select the respective scope in this section if you are building a [manifest-based app extension](/docs/app-extensions#manifest-based-app-extensions).  
  
_Example:_  
✅ _Read users data_  
✅ _See recent account activity_  
Installation URL| This is where you can add an optional URL to which users will be redirected when using your direct [installation link](/docs/marketplace-registering-a-private-app#get-your-installation-link).  
  
Use it when you need to start [app authorization](/docs/marketplace-oauth-authorization#step-1-requesting-authorization) outside of Pipedrive, redirect users to a custom landing page, or implement the [state parameter](/docs/marketplace-oauth-authorization-state-parameter) for additional security.  
Client ID| This is where you will get your app’s unique `client_id` and `client_secret` for [OAuth authorization](/docs/marketplace-oauth-authorization).  
  
> ## 👍
> 
> Once you’ve completed filling up the Basic info and OAuth & access scopes, we advise you to **start installing your app and testing it** to see how it works. You can do so by clicking on the green “Install & test” button in the bottom left of the tab.

### 

App extensions

[](#app-extensions)

![Developer Hub - private apps > app extensions](https://files.readme.io/d82718a-Developer_Hub_-_Private_app_-_App_extensions.png)

App extensions let you extend Pipedrive’s user interface with your app’s functionality and content to let users do more in one place. Find out more about them [here](/docs/app-extensions).

Within Developer Hub, the App extensions tab is where you can add new app extensions and manage the ones you’ve added before. A modal with an app extension creation form will open when you click the button to add the respective app extension.

You can also make your app live via this tab's “Change to live” button.

#### 

Link actions

[](#link-actions)

Learn more [here](/docs/app-extensions-actions).

Field| Description  
---|---  
Action name (required)| Insert your app action’s name that will be displayed in the Pipedrive UI. The name should be short, descriptive of the app action, and be in a sentence case format._Example: Send quote - Car Services_  
Action description| To showcase the interactive features of your app, your action’s name and description will appear in the Features section of your Marketplace app listing.  
  
Use the description field to let users know what they can do with this action.  
  
Optional; max 150 characters.  
URL link (required)| Add the URL that will redirect the user to the correct app page when an action is clicked. The URL must handle both scenarios of the user being logged into your app and not being logged in.  
  
_Example:<https://www.carservicesapp.com/handle_action>_  
[JWT](https://jwt.io/) secret| If left empty, `client_secret` will be used by default.  
Locations (one required)| Specify in which views the app action will be displayed. There can be a maximum of [3 app actions per app](/docs/app-extensions-actions#visibility-in-the-ui) or [custom modals](/docs/custom-ui-extensions-modals) in one view, altogether 21 (7 different views x 3 actions per view).  
  
_Example_ :  
✅ Activities list  
✅ Person details  
  
#### 

JSON modals

[](#json-modals)

Learn more [here](/docs/app-extensions-json-modals).

Field| Description  
---|---  
Action name (required)| The name of the JSON modal. The name should be short (max 30 characters), actionable, and sentence-cased (only capitalize the first word).  
  
_Example: + Prod. details - Car Services_  
Action description| To showcase the interactive features of your app, your action’s name and description will appear in the Features section of your Marketplace app listing.  
  
Use the description field to let users know what they can do with this action.  
  
Optional; max 150 characters.  
API endpoint (required)| All API requests related to this action will be sent to this URL.  
  
_Example:<https://www.carservicesapp.com/handle_action>_  
[JWT](https://jwt.io/) secret| If left empty, `client_secret` will be used by default.  
JSON schema (required)| The [JSON schema](/docs/app-extensions-json-modals#schema) for your JSON modal.  
Locations (one required)| There can be a maximum of 3 app actions or custom modals per location. Each app can have a total of 21 app actions. See more about available locations in [app actions' visibility](/docs/app-extensions-actions#visibility-in-the-ui).  
  
_Example: Deal details_  
  
#### 

JSON panels

[](#json-panels)

Learn more [here](/docs/app-extensions-json-panels).

Field| Description  
---|---  
Panel name (required)| Insert your JSON panel’s name that will be displayed in the Pipedrive UI. The JSON panel’s name should be descriptive and have a maximum of 30 characters.  
  
_Example: Car PM – Car Services_  
Panel description| To showcase the interactive features of your app, your panel’s name and description will appear in the Features section of your Marketplace app listing.  
  
Use the description field to let users know what they can do within this panel.  
  
Optional; max 150 characters.  
API Endpoint (required)| The URL of the endpoint which we'll use to fetch the data of the object properties  
  
 _Example:[www.api.pipedrive.com/deal-view/visits](http://www.api.pipedrive.com/deal-view/visits)_  
HTTP Auth username (required) and HTTP Auth password (required)| Our service will send the HTTP request with these credentials as the Basic Authentication header to protect your data. To protect your data, we strongly recommend using authenticated HTTPS requests. Note that we do not support self-signed certificates.  
[JWT](https://jwt.io) secret| JWT is required **if** HTTP Auth is not provided.  
JSON data structure (required)| A JSON file that describes the structure of your JSON panel as seen in the Pipedrive UI. See [here](/docs/json-panels-adding-a-panel#json-data-structure) for more information.  
Panel locations (one required)| Choose where the panel will be displayed:  
– Deal details  
– Person details  
– Organization details  
  
Each app can have one JSON or custom panel in each location.  
  
#### 

Custom modals

[](#custom-modals)

Learn more [here](/docs/custom-ui-extensions-modals).

Field| Description  
---|---  
Modal name (required)| The name of your custom modal. Descriptive, max 30 characters and should be sentence-cased (only capitalize the first word).  
Modal description| To showcase the interactive features of your app, your modal’s name and description will appear in the Features section of your Marketplace app listing.  
  
Use the description field to let users know what they can do within this modal.  
  
Optional; max 150 characters.  
Iframe URL (required)| URL of the web content to be shown within the iframe  
– Please ensure your iframe URL uses **HTTPS**  
[JWT](https://jwt.io) secret| Optional. Defaults to `client secret`  
Entry points| The custom modal will be shown as a link in the actions menu of the chosen entry point(s).  
  
Choose the location(s) your custom modal can be triggered from:  
– Activities list  
– Deal details  
– Deals list  
– Person details  
– People list  
– Organization details  
– Organizations list  
  
If no entry points are selected, the only way to open a modal is via the [SDK](https://github.com/pipedrive/app-extensions-sdk). Maximum 3 app extensions per location.  
  
Each app can have a total of 21 custom modals or app actions.  
  
#### 

Custom panels

[](#custom-panels)

Learn more [here](/docs/custom-ui-extensions-panels).

Field| Description  
---|---  
Panel name (required)| The name of your custom panel. Descriptive, max 30 characters and should be sentence-cased (only capitalize the first word).  
Panel description| To showcase the interactive features of your app, your modal’s name and description will appear in the Features section of your Marketplace app listing.  
  
Use the description field to let users know what they can do within this panl.  
  
Optional; max 150 characters.  
Iframe URL (required)| URL of the web content to be shown within the iframe  
– Please ensure your iframe URL uses **HTTPS**  
[JWT](https://jwt.io) secret| Optional. Defaults to `client secret`  
Panel locations (one required)| Choose where the custom panel will be displayed:  
– Deals details view  
– People details view  
– Organizations details view  
  
Each app can have one custom or JSON panel in each location.  
  
#### 

Custom floating window

[](#custom-floating-window)

Learn more [here](/docs/custom-ui-extensions-floating-window).

Field| Description  
---|---  
Floating window name (required)| The name of your custom floating window.  
  
Short and precise, max 30 characters.  
  
The name will appear in the window header and Interactive Features section of your Marketplace app listing.  
Floating window description (required)| Clearly state what users can do within the window so they know how this feature benefits them (max 150 chars).  
  
It will appear in the Interactive Features section of your Marketplace app listing.  
  
Max 150 characters.  
Iframe URL (required)| URL of the web content to be shown within the iframe  
– Please ensure your iframe URL uses **HTTPS**  
[JWT](https://jwt.io) secret| Optional. Defaults to `client secret`  
Entry points| A custom floating window has two entry points:  
– Top bar (apps dock) – default  
– Phone number and Calls tab – for communication apps  
  
Limited to 1 floating window per app regardless of the entry point.  
  
#### 

App settings page

[](#app-settings-page)

Learn more [here](/docs/custom-ui-extensions-app-settings).

Field| Description  
---|---  
Type| Choose how you want your app’s user to access their app settings  
– External link  
– Custom UI  
URL (required) – for external link| Add the URL that will redirect the user to your app settings page  
Iframe URL (required) – for ustom UI| URL of the web content to be shown within the iframe  
– Please ensure your iframe URL uses **HTTPS**  
[JWT](https://jwt.io/) Secret – for Custom UI| Optional. Defaults to`client secret`.  
  
> ## 👍
> 
> Do **install and test** your app after you add app extensions to see how it works for your users.

  


* * *

## 

Install and test your draft app

[](#install-and-test-your-draft-app)

* * *

Installing and testing your draft app is an important step before making your private app live. It enables you to ensure everything in your app runs smoothly and identify and address potential issues early on.

NB: app testing only works for users in your sandbox account and cannot be shared with external users.

To install and test your app, click the “Install and test” notification above your app’s name or the “Install & test” option from the three-dot menu.

![Developer Hub > private app - install & test](https://files.readme.io/d219bae-Developer_Hub_-_Private_app_-_install_and_test.png)

You can also click the green “Install & test” button at the bottom left of the OAuth & access scopes and App extensions tabs.

![Developer Hub > private app - install & test from the OAuth & access scopes tab](https://files.readme.io/441903e-Developer_Hub_-_Private_app_-_Install__test_-_OAuth__access_scopes.png)

You will then be brought to the OAuth confirmation dialog where you can allow and install your app to begin testing it.

* * *

## 

How to share your private app

[](#how-to-share-your-private-app)

* * *

There are two steps to sharing your private app with any user/company in Pipedrive:

  1. Make your private app live
  2. Get your installation link



### 

Make your private app live

[](#make-your-private-app-live)

You have to make your private app live before you can share it. You can do this by clicking the “Change to live” button in the app registration form or the “Change to live” option in the three-dot menu next to your private app’s name.

As we will validate your callback URL when you click “Change to live”, please **ensure your OAuth callback URL is a functioning one**.

Note that live private apps cannot be reverted to draft status. Any changes you make to your live private app will be immediately available for all users once you click ‘Save’.

**Change to live – app registration form**

_For new private apps_

![Developer Hub > private app - new app "change to live"](https://files.readme.io/bc39c67-Developer_Hub_-_Private_app_-_OAuth__access_scopes.png)

After you fill in your app name and callback URL in the Basic info tab and click “Save”, you will be brought to the OAuth & access scopes with the “Change to live” button enabled. Once the “Change to live” button is enabled, you can make your private app live anytime by clicking on it in any tab.  
  


_For draft private apps_

![Developer Hub > private app - draft app "change to live"](https://files.readme.io/17ca8c3-Developer_Hub_-_Private_app_-_draft_app_change_to_live.png)

The “Change to live” button will be enabled once you open your draft private app, as you’ve previously filled in and saved your app name and callback URL. You can make your private app live anytime by clicking “Change to live” in any tab of the app registration form.

**Change to live – three-dot menu**

![Private app - three-dot menu](https://files.readme.io/cb939b5-Developer_Hub_-_Private_app_-_three-dot_menu.png)

When you click on the three-dot menu next to your private app’s name, you will find the “Change to live” option. Clicking on this will take you to the Basic info tab of your private app, where you must click “Change to live” again to share your app.

### 

Get your installation link

[](#get-your-installation-link)

Once your private app is live, you can share it via its installation link. The installation link can be found in the three-dot menu next to your private app’s name in your Developer Hub dashboard.

![Developer Hub > private app - share install link](https://files.readme.io/bdd07b8-Developer_Hub_-_Private_app_-_share_private_app.png)

You can also find the installation link through the “Share app” button at the bottom left of your app’s OAuth & access scopes tab.

![Developer Hub > private app - share install link from OAuth & access scopes tab](https://files.readme.io/4dac119-Developer_Hub_-_Private_app_-_Install__test_-_OAuth__access_scopes.png)

* * *

## 

App status

[](#app-status)

* * *

![Developer Hub - apps list](https://files.readme.io/f18a664-Developer_Hub_dashboard_-_apps_list.png)

Private apps can have two statuses:

App status| Description  
---|---  
![App status - draft](https://files.readme.io/919b4df-Developer_Hub_-_app_status_-_draft.png)| Your app is in a draft state. It can be shared with users in the same Pipedrive company.  
![App status - draft](https://files.readme.io/fd32e40-Developer_Hub_-_private_app_status_-_live.png)| Your app is live and can be shared with any company in Pipedrive via its direct, unlisted installation link.  
  
__Updated 7 months ago

* * *

Read next

  * [App installation flows](/docs/app-installation-flows)
  * [OAuth authorization](/docs/marketplace-oauth-authorization)
  * [Updating the existing app](/docs/marketplace-updating-the-existing-app)


