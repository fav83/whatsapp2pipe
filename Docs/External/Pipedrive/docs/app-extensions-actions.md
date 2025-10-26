# Link actions

[ __Suggest Edits](/edit/app-extensions-actions)

## 

What are Link app actions?

[](#what-are-link-app-actions)

* * *

Links are **actions** that reroute users from Pipedrive to an external page hosted by your app to complete an action. It allows users to use and send the data from their Pipedrive accounts to your app. In this way, the data will gain value as it is displayed in context with the functionality of your app.

Link actions can give users the option to, for example, add contacts to email lists, create documents/proposals, send messages, and more with just a click of a button.

See how link actions can work for **a proposals and contacts app**. In this example, the app displays the name of the deal, the value of the deal, and the contact person's information in the app.

[ ![](https://i.imgur.com/oA3XqOD.gif)](https://i.imgur.com/oA3XqOD.gif)

See how link actions can work for **a bots and messaging app**. In this example, the app displays the contact person's name, info, and phone number.

[ ![](https://i.imgur.com/XmUafXk.gif)](https://i.imgur.com/XmUafXk.gif)

  


* * *

## 

Where are link actions found and how do they work?

[](#where-are-link-actions-found-and-how-do-they-work)

* * *

### 

Visibility in the UI

[](#visibility-in-the-ui)

Link actions can be added to the actions menu in the upper right area of the detail view and the list view. Link actions in the list view will appear when an item(s) is selected. Link actions are visible when the user clicks on the three-dot actions menu in detail and list views.

Each app is allowed to have **3 link actions or[JSON](/docs/app-extensions-json-modals)/[custom modals](/docs/custom-ui-extensions-modals) per view**. This means an app can have a total of **21** app extensions (link actions or JSON/custom modals) from menus (7 possible views x 3 extensions).

Item| List view| Detail view  
---|---|---  
Deals| ✅| ✅  
People| ✅| ✅  
Organization| ✅| ✅  
Activities| ✅| ⛔  
  
> ## 🚧
> 
> If the user hasn't selected any items in the list view, the link actions aren't available.

### 

How do the link actions work?

[](#how-do-the-link-actions-work)

When a user selects a link action from the menu, a new browser tab will be opened. Next, in the same browser tab, the user will be redirected to an app’s page if the user has an active app installation status. The redirection will be done to a URL consisting of the app’s URL (supplied by the app owner in the Developer Hub) and parameters that Pipedrive adds relating to the selected item(s). The added parameters enable the app to make requests to Pipedrive’s API and fetch data to allow the user to complete a link action.

Note that because the items selected by a user will directly relate back to the URL, you can run into a situation where several hundreds of items will be populated directly to the URL. In these scenarios, please be ready to encounter URL length limitation errors.

The new tab opened right after the user clicks the action has the following URL structure. The `:actionId` parameter in the URL is the unique identifier of the link action that Pipedrive will replace with a value.

New tab's URL structure
    
    
    https://{COMPANYDOMAIN}.pipedrive.com/app-extensions/actions/:actionId?resource=...&view=...
    

These are the parameters that are added to the URLs:

Parameter| Explanation or value(s)| Examples  
---|---|---  
`resource`| deal/person/organization/activity/product| `resource=deal`  
`view`| details or list| `view=details`  
`userId`| | `userId=12345`  
`companyId`| | `companyId=12345`  
`selectedIds`| Entity IDs that show all the selected IDs in an array form| 

  * If a user selects all the IDs through the select-all checkbox, then empty - `selectedIds=`
  * If a user selects an item in the detail view, the selectedIds will contain only that specific item's ID - `selectedIds=3`
  * If a user manually selects deals with `dealId=1` and `dealId=9` \- `selectedIds=1,9`
  * If a user decides to manually select all IDs in the list view, be ready to handle a very long URL with all the IDs in an array

  
`excludedIds`| Entity IDs that show all the excluded IDs in an array form (only in the list view)| 

  * If a user selects all the IDs through the select-all checkbox, then empty- `excludedIds=`
  * If a user selects all deals from the select-all checkbox and then removes manually some deals with `dealId=1` and `dealId=7` \- `excludedIds=1,7`
  * If a user decides to manually unselect all IDs in the list view, be ready to handle a very long URL with all the IDs in an array

  
`filter`| Stringified JSON object of filter type (filter or owner) and its ID (or "everyone") (only in the list view). In the activity list view, the object will include activity type and depending on user's choice Activity start date and end date.| 

  * A user has applied a custom filter from the "Filters" tab - `filter={"filter_id":42}`
  * A user has applied a user filter from "Owners" tab - `filter={"user_id":42}`
  * When "Everyone" is selected in the "Owners" tab - `filter={"everyone":1}`
  * When app action is triggered from**the activities list view** then extra parameters are applied to filter object. `activity_type` will list the selected activity types, for example:
    * `activity_type=””` all activity types are selected
    * `activity_type=”lunch,call”` specific activity types are selected
    * `activity_start_date` parameter is added when user selects activity start date, displayed in `YYYY-MM-DD` format
    * `activity_end_date` parameter is added when user selects activity end date, displayed in `YYYY-MM-DD` format

  
  
> ## 🚧
> 
> Note that in the **list view** , ` selectedIds` and ` excludedIds` will appear empty when all items are selected with the select-all checkbox.
> 
> `excludedIds` will also appear empty when just some items are manually selected.

### 

Example URLs

[](#example-urls)

Sample URL that is added to Developer Hub: <https://www.randomawesomeapp.com/action/handle>

**In the list view...**

The parameters that Pipedrive sends: ?resource=deal&view=list&userId=12345&companyId=12345&**selectedIds=1%2C9 &excludedIds=&filter=%7B%22everyone%22%3A1%7D  
**  
The whole list view URL: `https://www.randomawesomeapp.com/action/handle?resource=deal&view=list&userId=12345&companyId=12345&selectedIds=1%2C9&excludedIds=&filter=%7B%22everyone%22%3A1%7D`

In **the activities list view** when the activity start and end date are selected: `https://www.randomawesomeapp.com/action/handle?resource=activity&view=list&userId=12345&companyId=12345&selectedIds=1%2C9&excludedIds=&filter=%7B%22user_id%22%3A%2211%22%2C%22 activity_type%22%3A%22call%2Cmeeting%2Ctask%2Cdeadline%2Clunch%22%2C%22activity_start_date%22%3A%222020-12-08%22%2C%22activity_end_date%22%3A%222021-01-14%22%7D`

**In the detail view...**

The parameters that Pipedrive sends: ?resource=deal&view=details&userId=12345&companyId=12345&**selectedIds=9**

The whole detail view URL: `https://www.randomawesomeapp.com/action/handle?resource=deal&view=details&userId=12345&companyId=12345&selectedIds=9`

  


* * *

## 

How can I add a link action to Pipedrive?

[](#how-can-i-add-a-link-action-to-pipedrive)

* * *

You can add the link action when [registering an app](/docs/marketplace-registering-the-app) or when [updating an app](/docs/marketplace-updating-the-existing-app).

In [Developer Hub](https://app.pipedrive.com/developer-hub), click on your app’s name and go to the App extensions tab.

In the App extensions tab, click “Add link” in the Links section to access the form. Fill in the link action’s name and the rest of the relevant fields. Once you’re done, click “Save”.

Field| Description  
---|---  
Action name (required)| The name of the link action. Descriptive, max 30 characters.The name will appear in the Features section of your Marketplace app listing.  
Action description| To showcase the interactive features of your app, your action’s name and description will appear in the Features section of your Marketplace app listing.Use the description field to let users know what they can do with this action.Optional; max 150 characters.  
URL (required)| URL that the user will be redirected to when they click on the Link  
[JWT](https://jwt.io/) secret| If left empty, `client_secret` will be used by default  
Locations (one required)| Choose the view where the app action would be displayed:

  * Activities list
  * Deal details
  * Deals list
  * Person details
  * People list
  * Organization details
  * Organizations list

Maximum three app extensions per location. Each app can have 21 link actions or JSON/custom modals in total.  
  
  


* * *

## 

Link actions in app approval process

[](#link-actions-in-app-approval-process)

* * *

### 

What if my app has already been approved?

[](#what-if-my-app-has-already-been-approved)

If you already have an app or an integration available in the Pipedrive Marketplace, please use your [sandbox account](/docs/developer-sandbox-account) (request one if you don't have a sandbox account) for testing the new app actions. Remember that any changes saved when updating a public app in Developer Hub will immediately be visible to your app users.

### 

What to consider when I submit my app actions to review?

[](#what-to-consider-when-i-submit-my-app-actions-to-review)

When app actions are submitted for review, we will thoroughly test them before approval. We strongly advise testing your app actions on a test app before submitting it for reviewal. Here are some things to consider while developing the actions:

  * App actions must provide contextual information. This means that when the user has clicked an app action from inside the Pipedrive web app and they have been redirected to your app’s page, related data from the user’s Pipedrive account is displayed inside your app.
  * Your app must be able to handle app actions performed both when a user has logged in to your app as well as when the user is not logged into your app: 
    * If the user is logged in to your app, the actions initiated by a user from Pipedrive must be fulfilled from your app’s end.
    * If the user isn't logged in to your app, the URL must redirect to your app’s login or register an account page. After the user has logged in from the app's page, your app must be able to continue to fulfill the action initiated by the user in Pipedrive.
  * If the app is uninstalled from the vendors’ side, ensure that the app actions won’t appear in Pipedrive UI anymore. For more information, read about [handling user’s app uninstallation](/docs/app-uninstallation).

  


__Updated 7 months ago

* * *

Read next

  * [JSON modals](/docs/app-extensions-json-modals)
  * [JSON panels](/docs/app-extensions-json-panels)
  * [Visibility and development of app extensions](/docs/visibility-and-development-of-app-extensions)
  * [App extensions overview](/docs/app-extensions)


