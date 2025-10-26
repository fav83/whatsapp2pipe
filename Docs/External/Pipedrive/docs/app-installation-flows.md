# App installation flows

[ __Suggest Edits](/edit/app-installation-flows)

As part of our [app approval process](/docs/marketplace-app-approval-process), we ensure that users have a unified experience while authorizing the app to access their data and account. This is why we have pre-defined installation and [uninstallation flows](/docs/app-uninstallation).

From the app’s side, it is **mandatory** to have proper installation flows as a **prerequisite** for being listed on the Marketplace as a public app. This page goes more in-depth on [steps 1 to 5 of the OAuth authorization flow](/docs/marketplace-oauth-authorization) to show you how to handle different scenarios in the user’s journey.

* * *

When a user goes to the Pipedrive Marketplace, sees your app and wants to install it, they’ll have to click on the “Install now” or “Proceed to install” button. This will open an OAuth confirmation dialog in a new tab that displays [the scopes](/docs/marketplace-scopes-and-permissions-explanations) your app will require access to.

The user then has two choices:

  * To “Allow and Install” the app
  * To “Cancel” the app installation



> ## 📘
> 
> **Use`state` parameter for additional security**  
>  As it’s your responsibility to protect the security of your app’s users, we highly recommend using a `state` parameter provided by OAuth 2.0. Read more about it [here](/docs/marketplace-oauth-authorization-state-parameter).

  


* * *

## 

Allow and Install

[](#allow-and-install)

* * *

The user needs to agree to the required permissions (i.e., scopes) in order to use your app. When they click on “Allow and Install”, your app needs to ensure a smooth flow by covering the main scenarios that can happen:

  * A new user to your app who doesn’t have an account on your service and will need to register
  * The user has an account on your service, but the user is not logged into it
  * The user is logged in to your service



## 

A new user to your app

[](#a-new-user-to-your-app)

  * Store the `authentication code` (e.g., within the session)
  * Direct them to create an account and log in to your service
  * Exchange the `authentication code` for the `access token` and `refresh token`
  * Redirect them to a page where they can resume the installation/setup



## 

The user isn’t logged into your app

[](#the-user-isnt-logged-into-your-app)

When the user clicks “Agree & Install”, has an account on your service and isn’t logged in, you will have to:

  * Store the `authentication code` (e.g., within the session)
  * Direct them to log in to your service
  * Exchange the `authentication code` for the `access token` and `refresh token`
  * Redirect them to a page where they can resume the installation/setup



## 

The user is logged into your app

[](#the-user-is-logged-into-your-app)

When the user clicks “Agree & Install”, has an account on your service and is logged in, you will have to:

  * Exchange the `authentication code` for the `access token` and `refresh token`
  * Direct them to a page where they can resume the installation/setup



The end result should be a **successful** app installation and setup for all the flow scenarios described above.

[![Installation flow](https://files.readme.io/9bcedf9-Auth_code_user_flow_3.0.png)](https://files.readme.io/9bcedf9-Auth_code_user_flow_3.0.png)

  


* * *

## 

Cancel

[](#cancel)

* * *

If the user clicks “Cancel”, you’ll be notified that the installation didn’t happen as we will send a `GET` request to your `callback URL` with the additional parameter of `error=user_denied` (see also [OAuth authorization flow Step 3](/docs/marketplace-oauth-authorization#step-3-callback-to-your-app)).

The user will then be returned to the previously opened tab and can restart the installation process if they wish.  
  

