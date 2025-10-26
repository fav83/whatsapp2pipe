# App extensions overview

[ __Suggest Edits](/edit/app-extensions)

## 

What are app extensions?

[](#what-are-app-extensions)

* * *

**App extensions** allow apps to add interactive features that extend their app’s functionality in Pipedrive’s user interface. The extensions can help users to keep an eye on all of their everyday processes, share context about deals and contacts, and, above all, interact with different data provided by apps without switching between different tools.

Across Pipedrive’s UI, there are different extension points where apps can add interactive features, for example, sidebar panels, modals, actions menu and app settings.

Apps with app extensions bring extra value to their users as your app’s functionality is available directly inside Pipedrive’s UI, which helps to increase its visibility. App extensions increase the app's brand awareness as the app icon will be displayed inside Pipedrive after installation.

Furthermore, your app will have more visibility in [the Pipedrive Marketplace](https://www.pipedrive.com/en/marketplace) as it will be labeled with "Interactive features" filtering option, allowing it to be highlighted in the chosen app categories’ sections.

  


* * *

## 

Types of app extensions

[](#types-of-app-extensions)

* * *

We offer several app types extensions: **app actions** , **JSON panels** , **custom UI extensions** and **manifest-based app extensions**.

## 

App actions

[](#app-actions)

App actions let users perform your app’s related actions in Pipedrive’s list and detail views. We have **two** types of app actions: **links** and **JSON modals**.

### 

Links

[](#links)

![Link app action](https://files.readme.io/f18a910-Link_action.png)

[Links](/docs/app-extensions-actions) are app actions that reroute users from Pipedrive to an external page hosted by your app to complete an action.

### 

JSON modals

[](#json-modals)

![JSON modal](https://files.readme.io/7180077-JSON_modal.png)

[JSON modals](/docs/app-extensions-json-modals) are modals with predefined components that enable users to complete full actions inside Pipedrive, with the data being consistent between both platforms.  
  


## 

JSON panels

[](#json-panels)

![JSON panel](https://files.readme.io/1b7e0f1-JSON_panel.png)

[JSON panels](/docs/app-extensions-json-panels) allow users to see and use the data from your app through a panel with predefined components in Pipedrive’s detail views. They provide a visual representation of existing data from your app inside the Pipedrive web app.

![JSON panel gives an overview of multiple data fields](https://files.readme.io/25c7bc3-panelsample.gif) ![JSON panel gives an overview of multiple data fields](https://files.readme.io/25c7bc3-panelsample.gif)

JSON panel gives an overview of multiple data fields

![JSON modal is triggered from the JSON panel](https://files.readme.io/0e79e1f-Frame_149_1.png) ![JSON modal is triggered from the JSON panel](https://files.readme.io/0e79e1f-Frame_149_1.png)

JSON modal is triggered from the JSON panel

Having your app's data inside the panel with multiple customization methods will make using Pipedrive more contextual, as all information is centralized and easily accessible across different tools.  
  


## 

Custom UI extensions

[](#custom-ui-extensions)

[Custom UI extensions](/docs/custom-ui-extensions) allow an app to extend its functionality by loading any contextual web content in an embedded iframe directly inside different Pipedrive views. It is **mandatory to use** our [SDK](https://github.com/pipedrive/custom-app-surfaces-sdk) for all custom UI extensions.

We have **four** types of custom UI extensions: **custom floating window** , **custom panels** , **custom modals** and **custom UI for app settings**.

### 

Custom floating window

[](#custom-floating-window)

![Custom floating window](https://files.readme.io/7685eb9-Custom_floating_window.png)

A [custom floating window](/docs/custom-ui-extensions-floating-window) is an iframe embedded inside a resizable and draggable window that persists while a user navigates around Pipedrive.

### 

Custom panels

[](#custom-panels)

![Custom panel](https://files.readme.io/5180f4a-Custom_panel.png)

A [custom panel](/docs/custom-ui-extensions-panels) is an iframe embedded inside a sidebar panel in the detail view of deals, people, and organizations.

### 

Custom modals

[](#custom-modals)

![Custom modal](https://files.readme.io/f5ab078-Custom_modal.png)

A [custom modal](/docs/custom-ui-extensions-modals) is an iframe embedded in a modal that opens when triggered by the user from various menus and links inside Pipedrive.

### 

Custom UI for app settings

[](#custom-ui-for-app-settings)

[Custom UI for app settings](/docs/custom-ui-extensions-app-settings) is a fully customizable iframe surface within the Pipedrive Settings area. The surface can be found when users click on the Settings icon for your app in _Tools and apps > Marketplace apps_.  
  


## 

Manifest-based app extensions

[](#manifest-based-app-extensions)

Manifest-based app extensions allow an app to create an even tighter data flow with Pipedrive users. These apps can embed themselves into a designated area inside the Pipedrive product and offer alternative sources to complete an action such as messaging and video calling.

We offer **two** types of manifest-based extensions: **video calling app extension** and **messaging app extension**.

### 

Video calling app extension

[](#video-calling-app-extension)

![Video calling app extension](https://files.readme.io/2d9d45c-Video_calling_app_extension.png)

The [video calling app extension](/docs/video-calling-app-extension) is an entry point into Pipedrive’s Activities modal. It enables app users to generate and start a video call when setting up an Activity.

### 

Messaging app extension

[](#messaging-app-extension)

![Messaging app extension](https://files.readme.io/477f11d-Messaging_app_extension.png)

The [messaging app extension](/docs/messaging-app-extension) is an entry point into the Messaging inbox inside Pipedrive’s Leads Inbox. This allows apps to integrate a messaging service directly into Pipedrive and create a seamless flow of receiving and sending messages through a third-party tool.  
  


* * *

## 

App extensions comparison

[](#app-extensions-comparison)

* * *

| JSON extensions| Custom UI extensions| Manifest-based extensions  
---|---|---|---  
What is it| Enables users to see structured data from your app and complete simpler actions inside Pipedrive through a panel or modal with predefined components

  * Supports simpler business logic via predefined layout and customizable fields, objects and form elements
  * Faster to build as you only need to compose the JSON file and handle the requests we send you - the UI is rendered based on JSON definition 
  * Panel and modal components are predefined by Pipedrive

| Freedom to show data in any format and provide custom/complex interactions that are accessible within different embedded iframes across Pipedrive’s UI

  * Endless opportunities for building custom business logic and UI
  * Needs more resources to build
  * Easier to debug as you host the web content yourself

| Offering of alternative entry points related to video calling or messaging in Pipedrive

  * Provides a deeper, seamless user experience in specialized locations within Pipedrive
  * Potentially faster to build as you only need to implement specific API endpoints
  * All flows are predefined by Pipedrive

  
Type of extension| JSON schema

  * You have to plan your use case with Pipedrive’s predefined components
  * You have to create the JSON schema and validate it within Developer Hub
  * The UX is entirely defined by Pipedrive

| Iframe

  * You have to develop and host the web content to be displayed within the iframe, along with all frontend and backend capabilities
  * You have to design your own flows/UI that will be shown inside the iframe
  * You have to adhere to basic Pipedrive design guidelines for a cohesive UX

| Manifest

  * You only have to develop the backend and map your API endpoints against specific actions Pipedrive provides in our UI using the manifest file
  * The UX is entirely defined by Pipedrive

  
Locations| Detail views (Deals, Persons, Organizations)

  * JSON panels
  * JSON modals

List views (Deals, Persons, Organizations, Activities)

  * JSON modals

| Detail views (Deals, Persons, Organizations)

  * Custom panels
  * Custom modals

List views (Deals, Persons, Organizations, Activities)

  * Custom modals

App settings (in “Tools and apps -> Marketplace apps” section of Pipedrive’s UI)

  * Custom UI for app settings
  * Custom modals

| Activities modal in deal and lead detail views

  * Video calling app extension

Messaging inbox inside Leads inbox

  * Messaging app extension

  
Security (for outgoing requests)| JSON panels

  * Basic [HTTP authentication](/docs/json-panels-adding-a-panel#how-can-i-add-a-json-panel-in-developer-hub)

JSON modals

  * [JWT](https://jwt.io/)

| [JWT](https://jwt.io/)| [Authentication header](/docs/implementing-messaging-app-extension#authentication-of-the-request-from-pipedrive) that uses the same `client_id` and the `client_secret` as the OAuth token exchange in OAuth authorization.  
SDK| No| Yes| No  
  
  


__Updated 7 months ago

* * *

Read next

  * [Visibility and development of app extensions](/docs/company-wide-app-extensions)
  * [Link actions](/docs/app-extensions-actions)
  * [JSON modals](/docs/app-extensions-json-modals)
  * [JSON panels](/docs/app-extensions-json-panels)
  * [Video calling app extension](/docs/video-calling-app-extension)
  * [Messaging app extension](/docs/messaging-app-extension)


