# FAQ

[ __Suggest Edits](/edit/faq)

### 

Where can I find my `client_id`?

[](#where-can-i-find-my-client_id)

To find your `client_id,` you will have to

  1. Sign up for a [developer sandbox account](https://developers.pipedrive.com/)
  2. Go to [_Settings > (company name) Developer Hub_](https://app.pipedrive.com/developer-hub) in your developer sandbox account
  3. Click on “Create an app” or “+ Create an app” if you have existing apps
  4. Choose whether you would like to create a public or private app
  5. In the Basic Info tab of Developer Hub, fill in the required fields – App name and OAuth Callback URL


    
    
    * You can insert a non-functioning OAuth Callback URL for the time being
    

  1. Click the green “Save” button to save the form
  2. You’ll automatically be brought to the second tab, “OAuth & access scopes”, where you’ll get your `client_id` and `client_secret`

  


* * *

### 

How can I add additional users to a sandbox account?

[](#how-can-i-add-additional-users-to-a-sandbox-account)

You can add users to your account by going to _Settings > (company) > Manage users_ in the Pipedrive web app. For additional information or special requests, please contact [[email protected]](/cdn-cgi/l/email-protection#ee838f9c858b9a9e828f8d8bc08a8b989dae9e879e8b8a9c87988bc08d8183). 

  


* * *

### 

What should I consider when adding visuals to the Marketplace listing of your app?

[](#what-should-i-consider-when-adding-visuals-to-the-marketplace-listing-of-your-app)

When adding visuals for your app listing in the Marketplace, we advise you to consider adding multiple images with explanatory texts to showcase

  * How your app works with Pipedrive
  * What users can do with your app
  * How app extensions work for your users
  * The most common use cases so it increases users’ interest



You can also add one Youtube video link to demonstrate and market your app.

  


* * *

### 

When installing the app, the user gets an error containing the message → `{"error": "Invalid redirect URL"}`? How can I fix that?

[](#when-installing-the-app-the-user-gets-an-error-containing-the-message-→-error-invalid-redirect-url-how-can-i-fix-that)

The `redirect URL` is the same as the `callback URL`. You can see how the `redirect URL` is defined for your app in the Developer Hub. The error can occur when the `redirect URL`, defined in Developer Hub doesn't exactly match the `redirect URL` given to the user.

  


* * *

### 

Why do I get an error message stating "_App not found_ " when I try to access my app?

[](#why-do-i-get-an-error-message-stating-app-not-found-when-i-try-to-access-my-app)

This error message most likely appears because you were using another Pipedrive account from which the app was added (even if Developer Hub is enabled on both accounts, you would still get this error). Just switch back to the correct company which the app was first created on by clicking onto your profile > _Change company_ and choosing the company.

Additionally, we recommend clearing your cookies to help resolve the issue. When accessing your app from the correct Pipedrive account, the OAuth authentication process should work even if your app is in draft mode. For more information see the [OAuth authorization](/docs/marketplace-oauth-authorization).

  


* * *

### 

Why do I get the following error message `{"success":false,"error":"Scope and URL mismatch"}`?

[](#why-do-i-get-the-following-error-message-successfalseerrorscope-and-url-mismatch)

This error message appears because you might not have requested access to the correct scopes. For more information about which scopes to use and when to use them, see [scopes and permissions explained](/docs/marketplace-scopes-and-permissions-explanations).

  


* * *

### 

Can apps be installed for the whole company or does each user need to install the app for themselves?

[](#can-apps-be-installed-for-the-whole-company-or-does-each-user-need-to-install-the-app-for-themselves)

No, each user must individually install and allow access to the app for their account.

  


* * *

### 

Can the data in my live/production account be replicated in my developer sandbox account?

[](#can-the-data-in-my-liveproduction-account-be-replicated-in-my-developer-sandbox-account)

No, the data in developer sandbox accounts are completely separate and are in no way synced with live/production accounts.

  


* * *

### 

Why does it show `deleted: "true"` for deals but organizations (and other items) have an `active_flag: "false"` to display the status of the item?

[](#why-does-it-show-deleted-true-for-deals-but-organizations-and-other-items-have-an-active_flag-false-to-display-the-status-of-the-item)

A deal is shown as active or not with the combination of `deleted` and `active` parameters which both show boolean values. These parameters correspond directly with `active_flag` parameter values as follows: 

| Example of a Deal Status| Example of an Organization Status  
---|---|---  
Item is deleted| `active: "false", deleted: "true"`| `active_flag: "false"`  
Item is active| `active: "true", deleted: "false"`| `active_flag: "true"`  
  
  


* * *

### 

Why can’t I see the green "Publish" button in Developer Hub?

[](#why-cant-i-see-the-green-publish-button-in-developer-hub)

Apps that are [private](/docs/marketplace-creating-a-proper-app#private-apps) will not be published in the Pipedrive Marketplace.

To be able to publish your app and make it publicly available in our Marketplace), you’d need to submit it for [the app approval process](/docs/marketplace-app-approval-process). When the app is approved and works as expected (e.g., app listing is technically, logically and grammatically correct; all installation flows work flawlessly, etc.), you’ll be able to use the “Publish” button.  
  


__Updated 7 months ago

* * *
