# Webhooks for apps

[ __Suggest Edits](/edit/webhooks-for-apps)

> ##  📘
> 
> In this article, we focus on the **App-Specific** Webhooks, which can be created only by Marketplace apps.  
>  If you want to learn about our **general** webhooks, you can do it [here](/docs/guide-for-webhooks).

> ## 🚧
> 
> App-Specific Webhooks are **not** visible in the Pipedrive web app.

  


* * *

## 

Creating App-Specific Webhooks

[](#creating-app-specific-webhooks)

* * *

Webhooks can be created via our API by making a `POST` request to the [`/webhooks`](https://developers.pipedrive.com/docs/api/v1/Webhooks#addWebhook) endpoint. The created webhooks are not visible in the Pipedrive web app's UI. To be able to use these webhook endpoints, your app needs to have **the "admin" scope**. You can read more about scopes [here](/docs/marketplace-scopes-and-permissions-explanations). 

A single app can create a **max of 40** webhooks per app user.

  


* * *

## 

Querying App-Specific Webhooks

[](#querying-app-specific-webhooks)

* * *

In addition to the general webhooks created by an app user, additional webhooks (from your app) will be included in the response payload. Starting from May 5, 2021, only webhooks created by your app will be included in the response payload.

> ## 📘
> 
> App-Specific Webhooks are **not** visible in the Pipedrive web-app.

App-Specific Webhooks can only be queried through the API. Your app's webhooks can be distinguished from general webhooks by the `type` property - the value for App-Specific Webhooks is `application`, but for **general** webhooks it's `general`.

  


* * *

## 

Deleting App-Specific Webhooks

[](#deleting-app-specific-webhooks)

* * *

App-Specific Webhooks can only be deleted by your app via our API by making a `DELETE` request to the [`/webhooks/{id}`](https://developers.pipedrive.com/docs/api/v1/Webhooks#deleteWebhook) endpoint. Webhooks created by your app can't be deleted by other apps or by the app user.

When a user uninstalls your app, all the webhooks created by your app for this user will also be removed. If your app is ever removed from our Marketplace, any webhook created by your app will be removed from all users.

  


* * *

## 

Webhooks policy

[](#webhooks-policy)

* * *

The webhooks policy is applied to both [general](/docs/guide-for-webhooks) and App-Specific Webhooks.

Pipedrive has a Ban System for webhooks, which means that every time the original notification sending attempt fails on the first try (due to receiving a non-2xx response code or exceeding a timeout of 10 seconds) a ban counter will increase by one. When the counter reaches **10** on a webhook, this specific webhook will be banned for **30 minutes**. When the ban time is over, the webhook is reactivated and the ban counter set back to zero. Note that if a webhook is unreachable on the first try, its ban count will be increased and then standard retry logic will be applied, but if the webhook is unreachable during retries, the ban counter won’t be increased.

If there are **no** successful deliveries to a webhook in **3 consecutive days** , we will delete it.  
  


__Updated 7 months ago

* * *

Read next

  * [Guide for Webhooks](/docs/guide-for-webhooks)
  * [List of Webhooks](/docs/list-of-webhooks)
  * [State parameter](/docs/marketplace-oauth-authorization-state-parameter)
  * [Handling user app uninstallation](/docs/app-uninstallation)


