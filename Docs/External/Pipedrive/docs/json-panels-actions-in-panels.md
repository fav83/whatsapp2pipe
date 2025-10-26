# Actions in JSON panels

[ __Suggest Edits](/edit/json-panels-actions-in-panels)

> ##  📘
> 
> JSON panels were previously called app panels.

## 

Terminology

[](#terminology)

* * *

**JSON panels** – An entrance point for an app’s data and interactivity inside Pipedrive in a panel format

**Object** – A JSON panel object is a data entry point with multiple descriptive fields displayed inside a panel. A panel can contain multiple objects.

**Object actions menu** – A white “actions” button with an arrow pointing downwards at the object’s top right. It features a dropdown menu that gives access to [link(s)](/docs/app-extensions-actions) or [JSON modal(s)](/docs/app-extensions-json-modals). Object actions are specific to the object itself and **only available for multiple object panels**.

**Field** – Descriptive data field in a particular format within the object

**Field action** – A link or JSON modal that allows the user to interact with the data inside the field. The action is specific to the field itself.

**Global actions** – A green action button at the bottom of the JSON panel. It features one main [link action](/docs/app-extensions-actions) and a dropdown menu if there are multiple app actions and/or an external link.

**Actions menu** – A dropdown menu accessible from the three dots symbol on the top of the panel. The menu allows the user to manage the left sidebar, adjust panel and app settings, and access the same app action(s) as the one(s) defined in global actions.

  


* * *

## 

What are actions in panels?

[](#what-are-actions-in-panels)

* * *

Actions in panels allow you to add interactivity to different aspects of your app panel.

## 

Global actions

[](#global-actions)

![1202](https://files.readme.io/c37bae7-7fda530-App_extensions_-_footer_of_the_app_panel_-_Pipedrive.png)

Global actions in the JSON panel

Global actions are app actions for the entire JSON panel that is **specific to the detail view** that the user is in (deal, people, organization). As your JSON panel can be in [three detail views altogether](/docs/app-extensions-json-panels#visibility-in-the-ui), you can customize global actions for each app panel in each of the detail view.

Represented by a green action button unique to app panels, global actions can be found at the bottom left of the app panel. This is where you can add one main app action to be featured and two additional actions to be included in the global actions dropdown menu. You can have a **maximum of 3 actions** within global actions.

The actions within global actions can be a [link](/docs/app-extensions-actions) or a [JSON modal](/docs/app-extensions-json-modals). This means you can use

  * Links to reroute users from Pipedrive to an external page hosted by your app to complete an action
  * JSON modals to allow users to complete full actions in Pipedrive using an interactive component (a modal)



You can also add an additional external link to global actions by extending the API response with an [external link](/docs/json-panels-adding-a-panel#external-links) object.

## 

Object actions

[](#object-actions)

![1202](https://files.readme.io/c1d5525-669a43e-App_extensions_-_object_actions_app_panel_-_Pipedrive.png)

Object actions

Object actions are available at the top right of each object through a white “actions” button with an arrow pointing downwards that features a dropdown menu. You can add a **maximum of 3** link or JSON modal actions specific to the object itself. Object actions are universal for every object and **only available for multiple object panels**.

## 

Field actions

[](#field-actions)

![1202](https://files.readme.io/d8badf2-8e50fac-App_extensions_-_field_actions_app_panel_-_Pipedrive.png)

Field actions

Within each object are fields that display descriptive data in a certain format. You can add **one** link or JSON modal action to a field to allow users to interact with the data. Each panel object can have a **maximum of 3 fields with actions**.

  


* * *

## 

Steps for adding an action

[](#steps-for-adding-an-action)

* * *

Actions in panels can be added in the same section of Developer Hub where you add your JSON panels inside _Developer Hub > App extensions_.

  * Global actions are added via _links_ or _JSON modal_
  * Object and field actions are added via _App extensions > My added extensions > \+ Actions to this panel_



## 

How to add global actions

[](#how-to-add-global-actions)

Adding global actions to your panel is the same as adding a [link](/docs/app-extensions-actions) or a [JSON modal](/docs/app-extensions-json-modals). You can have a **maximum of 3 actions** within global actions.

### 

Link – global action

[](#link--global-action)

A link action will reroute users from Pipedrive to your app to complete the relevant action. Learn how to add a link [here](/docs/app-extensions-actions).

Field| Description  
---|---  
Action name (required)| Max 30 characters, in sentence-case  
URL (required)| The URL that handles the action in your app  
[JWT](https://jwt.io/) secret| If left empty, `client_secret` will be used by default  
Locations| The location where the action will be displayed in Pipedrive UI  
  
### 

JSON modal - global action

[](#json-modal---global-action)

A JSON modal allows users to complete actions with Pipedrive using an interactive component – modal. Learn how to add a JSON modal [here](/docs/app-extensions-json-modals).

Field| Description  
---|---  
Action name (required)| Max 30 characters, in sentence-case  
Action description| To showcase the interactive features of your app, your action’s name and description will appear in the Features section of your Marketplace app listing.Use the description field to let users know what they can do within this action.Optional; max 150 characters.  
API endpoint (required)| All API requests related to this action will be sent to this URL  
[JWT](https://jwt.io/) secret| If left empty, `client secret` will be used by default  
JSON schema(required)| The JSON schema for your JSON modal  
Locations| The location where the action will be displayed in Pipedrive UI  
  
### 

How to customize the order of global actions

[](#how-to-customize-the-order-of-global-actions)

By default, global actions are ordered by their creation timestamp. The newest one will be shown as the main action. This means that the last action saved (newest) will be the main action within the green global actions button, while the subsequent two actions you added before will be included in the dropdown menu.

![962](https://files.readme.io/d10ac6a-App_extensions_-_global_actions_-_Pipedrive.png)

Global actions at the bottom left of the app panel

In the picture example above, “Add an order” was the latest action saved, while “View all orders” and “Account settings” were saved earlier.

**Selecting the main action for global actions**

  * Go to _App extensions > My added extensions_ in Developer Hub
  * Find the JSON panel you want to customize global actions for
  * Click on the pencil icon to open the JSON panel form
  * Scroll to the bottom of the form to the “main action” field with a dropdown menu that enables you to select the main action for global actions

![1200](https://files.readme.io/e9a8885-App_extensions_-_JSON_panel_-_main_action_dropdown_menus.png)

The main action fields with a dropdown menu

Note that actions will **only appear** in the main action dropdown menu if both the link/JSON modal **and** the JSON panel you are customizing global actions for have the **same detail view** selected in _Locations_.

  * For example, suppose you want the “Add new order” link action to be the main action for global actions in your JSON panel within _deal details_. To do so, ensure _deal details_ is selected as a location for the “Add new order” link action **and** the JSON panel. Only then will you be able to find “Add new order” link action in the main action dropdown menu in the JSON panel's form.



![Ensure your action's Location is the same as your JSON panel](https://files.readme.io/91464a3-App_extensions_-_main_link_action_for_global_actions.png)

Ensure your action's Location is the same as your JSON panel

![The action will then appear in the main action dropdown menu in the JSON panel's form](https://files.readme.io/6b12e04-App_extensions_-_JSON_panel_main_action_selection.png)

The action will then appear in the main action dropdown menu in the JSON panel's form

Should you want to use the same action as the main action for all global action, ensure that all three details views (deal, person, organization) are selected in Locations.  
  


## 

How to add object actions and field actions

[](#how-to-add-object-actions-and-field-actions)

You can add object and field actions after you’ve saved your JSON panel. Both object and field actions can be a [link](/docs/app-extensions-actions) or a [JSON modal](/docs/app-extensions-json-modals).

  * Object actions are only available for multiple object panels, with **a maximum of 3** link or JSON modal actions
  * Field actions are available for single object and multiple object panels, with one link or JSON modal action added to a field to allow users to interact with the data. Each panel object can have a **maximum of 3 fields with actions**.



![Adding a link and object action](https://files.readme.io/519db72-App_extensions_-_JSON_panel_-_link_and_object_action.png)

### 

Link – objects and fields

[](#link--objects-and-fields)

A link object action and a link field action will reroute users fro Pipedrive to your app to complete the relevant action. Adding a link for objects and fields is the same.

  * Scroll down to the “My added extensions” section
  * Find the relevant JSON panel and click the “+ Actions to this panel” button below it
  * Select “Add link”



Field| Description  
---|---  
Action name (required)| Max 30 characters, in sentence-case  
Action type| Link  
URL (required)| The URL that handles the action in your app  
[JWT](https://jwt.io/) secret| If left empty, `client_secret` will be used by default  
Panel action target| The location where the link will be displayed:

  * Object – the action is universal for every object in your panel
  * Field – the action is specific to the selected field

  
  
### 

JSON modal - objects and fields

[](#json-modal---objects-and-fields)

A JSON modal object action and a JSON modal field action allow users to complete full actions in Pipedrive using an interactive component - modal. Adding a JSON modal for objects and fields is the same.

  * Scroll down to the “My added extensions” section
  * Find the relevant JSON panel and click the “+ Actions to this panel” button below it
  * Select “Add JSON modal”



Field| Description  
---|---  
Action name (required)| Max 30 characters, in sentence-case  
Action type| JSON modal  
API endpoint (required)| All API requests related to this action will be sent to this URL  
[JWT](https://jwt.io/) secret| If left empty, `client secret` will be used by default  
JSON data structure (required)| The JSON schema for your JSON modal  
Panel action target| The location where the JSON modal will be displayed:

  * Object – the action is universal for every object in your panel
  * Field – the action is specific to the selected field

  
  
  


* * *

## 

Troubleshooting

[](#troubleshooting)

* * *

As there are only two types of actions – [link](/docs/app-extensions-actions) and [JSON modal](/docs/app-extensions-json-modals), troubleshooting for actions in panels is the same as troubleshooting for these actions.

  * For links, please check within your app as link actions reroute users from Pipedrive to your app to complete the relevant action.
  * For JSON modals, please see [schema structure validation](/docs/app-extensions-json-modals#schema-structure-validation) and [schema data exchange on modal form submit](/docs/app-extensions-json-modals#schema-data-exchange-on-modal-form-submit).

  


__Updated 7 months ago

* * *

Read next

  * [JSON panels](/docs/app-extensions-json-panels)
  * [Adding a JSON panel](/docs/json-panels-adding-a-panel)


