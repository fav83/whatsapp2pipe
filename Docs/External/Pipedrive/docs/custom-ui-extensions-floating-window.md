# Custom floating window

[ __Suggest Edits](/edit/custom-ui-extensions-floating-window)

> ##  📘
> 
> NB: Please ensure you test your custom UI extensions on a **draft app** , not an approved/public one.

## 

What is a custom floating window?

[](#what-is-a-custom-floating-window)

* * *

![Custom floating window](https://files.readme.io/7685eb9-Custom_floating_window.png)

A custom floating window is an iframe embedded inside a resizable and draggable window that persists while a user navigates around Pipedrive.

### 

Custom floating window dimensions

[](#custom-floating-window-dimensions)

Both the height and width of a custom floating window can be customized. The minimum height is 70px, and the maximum height is 700px. The minimum width is 200px, and the maximum width is 800px.

  


* * *

## 

How can custom floating windows be used?

[](#how-can-custom-floating-windows-be-used)

* * *

![1600](https://files.readme.io/ed8238d-Custom_floating_window_in_Pipedrives_user_interface.png)

Custom floating window in Pipedrive's user interface

Custom floating windows differ slightly from other custom UI extensions as they can be persistent, resizeable and draggable.

Users can drag the floating window around Pipedrive’s interface, while apps can resize it and make it visible where appropriate, e.g., when a user receives an incoming call/message. This allows you even more flexibility to showcase contextual web content with relevant actions to users as they navigate around Pipedrive.

Here are some examples of how your app can use the custom floating window along with the apps dock and its notification function.

**Calling and Computer Telephony Integration (CTI) apps**

  * Making an outgoing call
  * Answering an incoming call
  * Indicating an item(s) that needs attention, e.g., missed calls, assigned tasks or other notifications
  * Taking notes, creating tags or any other in-call activity
  * Specifying call outcomes and/or creating follow-up actions (or any other post-call activity)



**Messaging apps**

  * Instant messaging conversations with leads/customers from anywhere in Pipedrive (allows for providing more context than just the Messenger inbox)
  * Getting notifications of incoming and/or missed messages



**Other types of apps**

  * Displaying an overview of incoming support cases
  * Displaying a stream of contextual events from email marketing, lead generation and other customer engagement tools, e.g., campaign click rates, webform/survey submissions, website visits, etc.
  * Any use case that isn’t tied to a specific entity (deal, person, organization) or view (list, detail)  
  




* * *

## 

How does a custom floating window work?

[](#how-does-a-custom-floating-window-work)

* * *

![1165](https://files.readme.io/2f806d1-Custom_floating_window_-_flow_diagram.png)

Data flow for custom floating windows

A custom floating window is an embedded iframe inside a resizable and draggable window that persists while a user navigates around Pipedrive.

The webpage to be embedded must be hosted externally and have its own publicly accessible URL along with relevant front-end and back-end capabilities. Any JS framework and language can be used to build the custom floating window’s front and back end.

When a custom floating window gets loaded or reloaded, an iframe request with query parameters will be sent. This should be validated in the app’s backend using the provided JWT. The webpage from the URL you provide in Developer Hub should then render the contents of the floating window and initialize the App Extensions [SDK](https://github.com/pipedrive/app-extensions-sdk) so users can use the floating window.

The iframe request will contain the following query parameters:

Parameter| Explanation/value(s)| Examples  
---|---|---  
`userId`| | `userId=12345`  
`companyId`| | `companyId=54321`  
`token`| JWT that identifies which user and which PD company is loading the iframe| `token=xxxxx.yyyyy.zzzzz<`  
`id`| Unique ID/runtime token for the surface that has to be passed to the SDK| `id=56789`  
  
The JWT (`token`) has to be validated server-side and you will have to initialize the [SDK](https://github.com/pipedrive/app-extensions-sdk) with the provided `id`.

  * The `JWT secret` can be specified in Developer Hub when adding your custom UI extension. If no value is added in Developer Hub, we will use the `client secret` as the `JWT secret` value by default.



Note: The [SDK](https://github.com/pipedrive/app-extensions-sdk) will try to read the `id` from the URL itself. In most cases, the `id` will not have to be passed manually. It has to be manually passed only if you modify the iframe URL, e.g., with redirects.

  


#### 

Focus mode

[](#focus-mode)

Focus mode allows apps to hide the ‘X’ close button in the top right corner of the floating window. This is especially useful while the user is completing an action; for example,

  * When the user is on an ongoing call
  * When the user should fill in a form before closing the floating window



Using the [`SET_FOCUS_MODE` command](https://github.com/pipedrive/app-extensions-sdk#set-focus-mode), apps can enable focus mode to hide the close button or disable it to make the close button visible.

Users cannot close the floating window when the focus mode is enabled. Hence, there should be a clear indication to end the focus mode and allow users to close the floating window, e.g., an end call button/clickable element that invokes the [`HIDE_FLOATING_WINDOW` command](https://github.com/pipedrive/app-extensions-sdk#hide-floating-window).

Whenever a floating window is opened, the focus mode is disabled by default, which means the close button will be visible. This is to ensure that users have the option to close the window in the event they open it by accident and to avoid having any windows that cannot be closed.

#### 

Window dimensions

[](#window-dimensions)

Each custom floating window can have:

  * A minimum height of 70px and a maximum height of 700px
  * A minimum width of 200px and a maximum width of 800px  
  




### 

Custom floating window for calling apps

[](#custom-floating-window-for-calling-apps)

#### 

Outgoing calls

[](#outgoing-calls)

![1298](https://files.readme.io/1ebcb0d-N_-_Calling_integration_flow_-_outbound_call_-_ERD.png)

Data flow for outgoing calls

The floating window iframe will initialize for outgoing calls when Pipedrive is loaded and remain in the background. It can be made visible via an [SDK](https://github.com/pipedrive/app-extensions-sdk) command or input from a Pipedrive user.

**User flows for outgoing calls**  
When a Pipedrive user intends to make an outgoing call, they can do so by clicking on

  * The phone number of a person or an organization
  * The call tab in deal, person and organization detail views



Users can see a calling options menu with calling app recommendations if they don't have a calling app installed. Should the user decide to use a calling app, they can proceed to install it from the Pipedrive Marketplace.

If users have installed one calling app, they can use the configured app to begin their call.

If users have multiple calling apps installed, they can go to the same calling options menu to choose the app of their choice to begin their call.

**Data flow for outgoing calls**  
In parallel, your app should subscribe to the [visibility event via our SDK](https://github.com/pipedrive/app-extensions-sdk#visibility). You will then get notified of a visibility change with an optional `context` parameter so that you can initiate the outgoing call for the user. _We are open to feedback on what other parameters are useful for this use case._

The user can now interact with the floating window for the call. When the call is completed, the app can invoke another [SDK command to hide the window](https://github.com/pipedrive/app-extensions-sdk#hide-floating-window) while making API requests to Pipedrive for relevant details such as [call logs](https://developers.pipedrive.com/docs/api/v1/CallLogs), [notes](https://developers.pipedrive.com/docs/api/v1/Notes), [activities](https://developers.pipedrive.com/docs/api/v1/Activities), etc. Apps can also invoke [SDK](https://github.com/pipedrive/app-extensions-sdk) commands to display pre-filled new activity creation modal or navigate the user to another page.  
  


#### 

Incoming calls

[](#incoming-calls)

![1198](https://files.readme.io/14ecff0-N_-_Calling_integration_flow_-_inbound_call_-_ERD.png)

Data flow for incoming calls

The floating window iframe will initialize for incoming calls when Pipedrive is loaded and remain in the background, awaiting input from a Pipedrive user or your app. When a person calls a Pipedrive user via your app, your app should get notified of the call and invoke an [SDK command to change the floating window’s visibility](https://github.com/pipedrive/app-extensions-sdk#show-floating-window) for the user.

The user can then interact with the floating window for the call. When the call ends, your app can invoke another [SDK command to hide the window](https://github.com/pipedrive/app-extensions-sdk#hide-floating-window) while making API requests to Pipedrive for relevant details such as [call logs](https://developers.pipedrive.com/docs/api/v1/CallLogs), [notes](https://developers.pipedrive.com/docs/api/v1/Notes), [activities](https://developers.pipedrive.com/docs/api/v1/Activities), etc.  
  


* * *

## 

Visibility in Pipedrive’s UI

[](#visibility-in-pipedrives-ui)

* * *

![1600](https://files.readme.io/c2c5c97-Custom_floating_window_in_Pipedrives_user_interface.png)

Custom floating window in Pipedrive’s user interface

### 

Entry points

[](#entry-points)

A custom floating window has the following entry points:

**Top bar – apps dock**  
This is the [default entry point](/docs/custom-ui-extensions-floating-window#apps-dock-in-the-top-bar) for custom floating windows. Apps with a floating window will be displayed in a popover visible from the puzzle icon in the top bar.

**Phone number**

![Phone number entry point](https://files.readme.io/e83a129-Phone_number_entry_point.png)

The phone number entry point is for communication apps to trigger an action via the clicked person’s or organization’s phone number.

**Call tab in deal, person and organization detail views**  
Communication apps can trigger an action via the call tab in deal, person and organization detail views. This entry point works the same way as the phone number entry point.

**Via SDK**  
This programmatic entry point allows apps to make their custom floating window visible anytime, e.g., when an inbound call/message is received.

Each app can have **one floating window** in Pipedrive’s UI regardless of the entry point. The floating window can have a maximum width of 800px and a maximum height of 700px.  
  


### 

Apps dock in the top bar

[](#apps-dock-in-the-top-bar)

![3200](https://files.readme.io/87dc4f5-Apps_dock_in_top_bar.png)

Apps dock and popover in the top bar

The apps dock located in the right corner of the top bar is the default entry point for apps with a custom floating window.

#### 

**Popover**

[](#popover)

Apps will be listed alphabetically by the app's name in a popover visible from the puzzle icon in the top bar. Installed apps are split into two categories in the popover:

  1. Apps with a custom floating window
  2. All installed apps



Apps can only appear in one category in the popover.

#### 

**Pinned apps in the apps dock**

[](#pinned-apps-in-the-apps-dock)

Apps, represented by their icon, will appear in the apps dock when a user pins it. Users can pin or unpin an app with a floating window by clicking on the pin icon next to the app’s floating window name in the popover.

The apps dock is responsive and will adapt to the space available for it in the top bar. The available space depends on various factors such as device type and browser window size (e.g., a user may resize their browser window).

#### 

**Order of pinned apps**

[](#order-of-pinned-apps)

Pinned apps will appear on the left side of the puzzle icon in the apps dock according to the time they are pinned. This means that the first pinned app will be the furthest away from the puzzle icon, and the latest pinned app will be the closest to the puzzle icon.

As the apps dock is responsive, pinned apps will get hidden from the left when the apps dock has to adapt to the space available in the top bar. Users will, therefore, see their latest pinned apps first.  
  


### 

Notifications

[](#notifications)

Apps with a custom floating window can indicate the number of notifications a user has. Notifications will be displayed as a number within a notification badge in the apps dock or the popover. Using the [`SET_NOTIFICATION` command in our SDK](https://github.com/pipedrive/app-extensions-sdk#set-notification), apps can use notifications to represent any important activity for users, e.g., missed calls/messages, overdue items and account changes.

#### 

**If the app is pinned**

[](#if-the-app-is-pinned)

![Apps dock with notifications and pinned apps](https://files.readme.io/4f29ef7-Apps_dock_with_notifications.png)

If the app is pinned, the number of notifications will be displayed in a notification badge next to its icon in the apps dock.

  * The highest number of notifications that can be displayed next to app icons in the apps dock is 9+, even if the total number of notifications exceeds that.



#### 

**If the app is not pinned or is pinned but not visible**

[](#if-the-app-is-not-pinned-or-is-pinned-but-not-visible)

![Popover with notifications](https://files.readme.io/a3cc693-Popover_with_notifications.png)

If the app isn’t pinned or is pinned but not visible due to the responsiveness of the apps dock, the number of notifications will be displayed in a notification badge next to its icon in the popover. The puzzle icon will subsequently display the total number of notifications a user has for unpinned and pinned but not visible apps.

  * The highest number of notifications that can be displayed next to app icons in the popover is 99+, even if the total number of notifications exceeds that.
  * The highest number of notifications that can be displayed next to the puzzle icon in the apps dock is 9+, even if the total collective number of all app notifications exceeds that.

  


* * *

## 

How can I add a custom floating window in Developer Hub?

[](#how-can-i-add-a-custom-floating-window-in-developer-hub)

* * *

![Custom floating window](https://files.readme.io/e4dcb5b3c947d8d5817f33f2ce9b099f7dd932900ef3d3f617620e42b3b65d41-custom-floating-window.png)

In [Developer Hub](https://app.pipedrive.com/developer-hub), click on your app’s name and go to the App extensions tab.

In the App extensions tab, click “Add custom floating window” in the Custom floating window section to access the form. Fill in the custom floating window’s name and the rest of the relevant fields. Once you’re done, click “Save”.

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
  
> ## 📘
> 
> It is **mandatory to use** [our SDK](https://github.com/pipedrive/app-extensions-sdk) to initialize the webpage within your custom floating window and communicate with the main Pipedrive window.

__Updated 3 months ago

* * *
