# Developer Hub

[ __Suggest Edits](/edit/developer-hub)

Developer Hub, formerly Marketplace Manager, is a tool for creating and maintaining your app in the [Pipedrive Marketplace](https://pipedrive.com/marketplace). It’s the starting point for your app creation process and where you create and maintain it. Everything you need to do to create and support your app is done through Developer Hub.

![Developer sandbox](https://files.readme.io/5c59419-Developer_sandbox_account_overview.png)

You can access Developer Hub by logging in to your [developer sandbox account](https://app.pipedrive.com/auth/login) and going to [_Settings > (company name) Developer Hub_](https://app.pipedrive.com/developer-hub). Through it, you can:

  * [Save a draft app and get your `client_id` and `client_secret`](/docs/developer-hub#save-a-draft-app)
  * [Register your app ](/docs/developer-hub#registering-your-app)
  * [Update and maintain your app](/docs/developer-hub#updating-and-maintaining-your-app)
  * [Delete your app](/docs/developer-hub#deleting-your-app)

  


* * *

## 

Save a draft app

[](#save-a-draft-app)

* * *

First, you need to save a draft app to start working on your app. Why? Because this is where you’ll get your `client_id` and `client_secret` – 2 crucial elements required for [OAuth authorization](/docs/marketplace-oauth-authorization). Learn how to get them [here](/docs/client-id-and-client-secret).

The two main required fields that are necessary **to save your draft app** are your **app name** and the **OAuth callback URL**. All other fields marked as required will be validated when you send your app to review.

> ## 📘
> 
> **Take note** : If you initially inserted a non-functioning OAuth callback URL, make sure you change it to a functioning one before submitting it for approval.

  


* * *

## 

Registering your app

[](#registering-your-app)

* * *

> ## 🚧
> 
> NB: Do pick your app type carefully, as it cannot be changed later on Developer Hub.

### 

Registering public apps

[](#registering-public-apps)

[Registering your app](/docs/marketplace-registering-the-app) is a major step in the app creation process before you send it off for the [app approval process](/docs/marketplace-app-approval-process). This is when you fill out all the details of your app and its listing page on the Pipedrive Marketplace.

To give your app users a good user experience, there are three crucial aspects to take note of when registering your app:

#### 

Marketing

[](#marketing)

Along with your app’s name and icon, the [General Info](/docs/marketplace-registering-the-app#general-info) tab is where you should include marketing details about your app.

What exactly does your app do? Why is its integration with Pipedrive useful? Tell users about it through a summary, a longer description, app listing images and a video link.

#### 

Scopes and permissions

[](#scopes-and-permissions)

The [OAuth & access](/docs/marketplace-registering-the-app#auth--access-scopes) scopes tab is where you will specify the types of data your app needs access to, depending on the endpoints your app uses.

It’s important to choose only the scopes necessary for your app. Start by choosing the least amount of scopes needed, then enable additional scopes – according to [this mapping](/docs/marketplace-scopes-and-permissions-explanations#list-of-scopes) – based on the endpoints used in your app.

#### 

Installation flows

[](#installation-flows)

Before sending your app to review, check to ensure that your app handles our main pre-defined installation and [uninstallation flows](/docs/app-uninstallation). This is **mandatory** for all public apps. Your app should present a unified experience as users authorize access to their data and account for all installation scenarios. Read more about app installation flows [here](/docs/app-installation-flows).  
  


### 

Registering private apps

[](#registering-private-apps)

There is a slightly different flow for [registering your private app](/docs/marketplace-registering-a-private-app). Private apps can be shared with any user/company in Pipedrive via a direct, unlisted installation link. They don’t have to go through the app approval process and will not be published in the Pipedrive Marketplace.

Hence, private apps will only have to fill out the parts of the app registration form that cover app creation.

  


* * *

## 

App status

[](#app-status)

* * *

The app’s status is displayed in a pill next to the app name in Developer Hub.

![Developer Hub - apps list](https://files.readme.io/b7e60b7-Developer_Hub_dashboard_-_apps_list.png)

### 

Public apps status

[](#public-apps-status)

Public apps can have four statuses:

App status| Description  
---|---  
![App status - draft](https://files.readme.io/919b4df-Developer_Hub_-_app_status_-_draft.png)| Your app is in a draft state. Please start installing and testing it before sending it for review.  
![App status - review](https://files.readme.io/0bc4153-Developer_Hub_-_app_status_-_review.png)| Your app has been sent for review and is being reviewed by the Marketplace team.  
![App status - unpublished](https://files.readme.io/4aef7c6-Developer_Hub_-_app_status_-_unpublished.png)| Your app is approved by the Marketplace team. It remains unpublished as you have to publish it yourself.  
![App status - published/live](https://files.readme.io/cd5e758-Developer_Hub_-_app_status_-_published_-_live.png)| Your app is published and publicly visible in the Pipedrive Marketplace.  
  
  


### 

Private apps status

[](#private-apps-status)

Private apps can have two statuses:

App status| Description  
---|---  
![App status - draft](https://files.readme.io/919b4df-Developer_Hub_-_app_status_-_draft.png)| Your app is in a draft state. It can be shared with users in the same Pipedrive company.  
![App status - draft](https://files.readme.io/fd32e40-Developer_Hub_-_private_app_status_-_live.png)| Your app is live and can be shared with any company in Pipedrive via its direct, unlisted installation link.  
  
  


* * *

## 

Updating and maintaining your app

[](#updating-and-maintaining-your-app)

* * *

[Updating your app](/docs/marketplace-updating-the-existing-app) to maintain it is similar to registering it. Within Developer Hub, you can make various changes to your app listing, such as your app listing’s images, video (YouTube) link, descriptions and more.

This is where you can also make more significant changes, such as:

  * Changing the scopes of your app
  * Changing your app name
  * Hiding your app to unlist it



Depending on what you change/edit in your app, you **may have to go through** the [app approval process](/docs/marketplace-app-approval-process) again. Learn how to update approved apps [here](/docs/marketplace-updating-the-existing-app).  
  


* * *

## 

Deleting your app

[](#deleting-your-app)

* * *

Should you wish to remove your app from the Pipedrive Marketplace, you can do so via Developer Hub. Find out more about how to delete your app [here](/docs/marketplace-deleting-the-existing-app).

Deleting your app means it will no longer be visible in Developer Hub nor listed in the Pipedrive Marketplace. It will also be uninstalled from all existing customers.  
  


__Updated 7 months ago

* * *

Read next

  * [Registering a public app](/docs/marketplace-registering-the-app)
  * [Registering a private app](/docs/marketplace-registering-a-private-app)
  * [App installation flows](/docs/app-installation-flows)
  * [Updating the existing app](/docs/marketplace-updating-the-existing-app)
  * [Deleting the existing app](/docs/marketplace-deleting-the-existing-app)
  * [How to get your Pipedrive Marketplace app approved on the first review](https://medium.com/pipedrive-engineering/getting-your-marketplace-app-approved-on-the-first-review-is-it-even-possible-628b7e5eca47)
  * [App approval process](/docs/marketplace-app-approval-process)
  * [OAuth authorization](/docs/marketplace-oauth-authorization)


