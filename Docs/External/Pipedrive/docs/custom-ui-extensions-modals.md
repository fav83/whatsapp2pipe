# Custom modals

[ __Suggest Edits](/edit/custom-ui-extensions-modals)

> ##  📘
> 
> NB: Please ensure you test your custom UI extensions on a **draft app** , not an approved/public one.

## 

What is a custom modal?

[](#what-is-a-custom-modal)

* * *

![Custom modal](https://files.readme.io/7d43a91-Custom_modal.png)

A custom modal is an iframe embedded in a modal. The modal opens when a user triggers it from various menus and links inside Pipedrive.

Custom modals allow your app’s users to complete more complex and distinct actions, for example, creating new proposals/invoices.

**Custom modals VS custom panels**

| Custom modal| Custom panel  
---|---|---  
Iframe| Yes| Yes  
Size| – Height and width are adjustable as a modal can have a bigger area| – Limited to the sidebar panel in deal/person/organization detail view  
– Adjustable height  
Inside Pipedrive’s UI| – Multiple entry points, including list and detail views as well as via the SDK  
– Take note that it will block content that’s beneath it| – Deal/person/organization detail view  
– Appears as a panel within the detail view  
  
### 

Custom modal dimensions

[](#custom-modal-dimensions)

Both the height and width of custom modals can be customized. The minimum height is 120px, and the minimum width is 320px. The maximum height and width are limited to the user’s browser dimensions.

  


* * *

## 

Custom modals in Pipedrive’s UI

[](#custom-modals-in-pipedrives-ui)

* * *

![Custom modal](https://files.readme.io/efa3b83-Custom_UI_extensions_-_custom_modal.png)

Here are the possible entry points in Pipedrive’s UI where a custom modal can be triggered from:

## 

Custom modals in actions menus

[](#custom-modals-in-actions-menus)

![Custom modal](https://files.readme.io/f043668-App_actions.png)

_A custom modal from the actions menu_

Similar to [links](/docs/app-extensions-actions) and [JSON modals](/docs/app-extensions-json-modals#what-are-json-modals), entry points to custom modals can be added to the three-dot actions menu in the upper right area of both the detail and list views.

Custom modals in list views will only appear when an item(s) is selected. Custom modals will pop up when the user clicks on its name in the actions menu in the detail and list views.

Each app can have **three custom/JSON modals or link actions per view**. This means an app can have a total of 21 app extensions from menus (7 possible views x 3 extensions).

Item| List view| Detail view  
---|---|---  
Deals| ✅| ✅  
People| ✅| ✅  
Organization| ✅| ✅  
Activities| ✅| ⛔  
  
## 

Custom modals in custom panels

[](#custom-modals-in-custom-panels)

Custom modals can be triggered from [custom panels](/docs/custom-ui-extensions-panels) using the [SDK](https://github.com/pipedrive/app-extensions-sdk).

## 

Custom modals in app settings

[](#custom-modals-in-app-settings)

Custom modals can be triggered from app settings with a custom UI via the [SDK](https://github.com/pipedrive/app-extensions-sdk). App settings can be found in the Pipedrive web app via _Tools and apps > Marketplace apps_.

If you want to add a custom UI for your app’s settings, please click [here](/docs/custom-ui-extensions-app-settings).

## 

Custom modals via SDK

[](#custom-modals-via-sdk)

Custom modals can be triggered with the [SDK’s](https://github.com/pipedrive/app-extensions-sdk)'s open modal command by providing the modal `id` or `name`. Using the [SDK](https://github.com/pipedrive/app-extensions-sdk), you can also pass any data to the modal that can be read from the URL parameters.  
  


* * *

## 

How can I add a custom modal in Developer Hub?

[](#how-can-i-add-a-custom-modal-in-developer-hub)

* * *

![Custom modal](https://files.readme.io/f38466bae57527fa03f08bc29631ea052e8cfea140401ff5c77eafb814f156db-custom-modal.png)

## 

Adding a custom modal for actions menus

[](#adding-a-custom-modal-for-actions-menus)

In [Developer Hub](https://app.pipedrive.com/developer-hub), click on your app’s name and go to the App extensions tab.

In the App extensions tab, click “Add custom modal” in the Custom modal section to access the form. Fill in the custom modal’s name and the rest of the relevant fields. Once you’re done, click “Save”.

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
  
## 

Adding a custom modal - custom panels, settings & via SDK

[](#adding-a-custom-modal---custom-panels-settings--via-sdk)

To add a custom modal via the SDK and for custom panels and app settings, you will have to:

  1. Add a modal to Developer Hub using the [same steps listed above](/docs/custom-ui-extensions-modals#adding-a-custom-modal-for-actions-menus).
  2. Leave the Entry point field blank
  3. Copy the ID
  4. Use the ID as the `action_id` parameter for custom modal in the [SDK](https://github.com/pipedrive/app-extensions-sdk)



> ## 📘
> 
> It is **mandatory to use** [our SDK](https://github.com/pipedrive/app-extensions-sdk) to initialize the webpage within your custom modal and communicate with the main Pipedrive window.

  


* * *

## 

How to troubleshoot a custom modal

[](#how-to-troubleshoot-a-custom-modal)

* * *

**Note: The app has to be installed by the user for them to be able to use custom UI extensions.**

A custom modal is dependent on the iframe URL provided in Developer Hub. If users can’t trigger the modal and/or see the modal’s content, this could mean:

  * The web content failed to load
  * The runtime `id` provided was wrong
  * The [SDK](https://github.com/pipedrive/app-extensions-sdk) wasn’t initialized > if the iframe takes more than 10 seconds to initialize via our SDK, the iframe won't be displayed to the user.



Please check the iframe URL you provided, its frontend and backend capabilities, and the runtime `id` provided to the [SDK](https://github.com/pipedrive/app-extensions-sdk).  
  


* * *

## 

How to troubleshoot SDK errors

[](#how-to-troubleshoot-sdk-errors)

* * *

Should you encounter any [SDK](https://github.com/pipedrive/app-extensions-sdk) errors, please read the **developer tools console** to find out what went wrong.  
  


__Updated 3 months ago

* * *

Read next

  * [Custom UI for app settings](/docs/custom-ui-extensions-app-settings)
  * [Custom UI extensions](/docs/custom-ui-extensions)
  * [Custom panels](/docs/custom-ui-extensions-panels)


