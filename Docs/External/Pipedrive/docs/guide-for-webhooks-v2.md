# Guide for Webhooks v2

[ __Suggest Edits](/edit/guide-for-webhooks-v2)

> ##  📘
> 
> This guide focuses on **version 2 (v2)** of our **general** webhooks.
> 
> If you want to learn about our App-Specific Webhooks, which can be created only by Marketplace apps, then you can do it [here](/docs/webhooks-for-apps).

## 

About webhooks

[](#about-webhooks)

* * *

**Webhooks** allow you to get programmatic notifications from Pipedrive about changes to your data as they happen. If you’re new to webhooks, [read this guide](https://requestbin.com/blog/working-with-webhooks/) to learn more.

Webhooks v2 brings **added reliability and stability** by **reducing duplicate and missing webhook triggers** and **delays** and giving you **better debugging** capabilities. In addition, you can now **create`lead` webhooks** in v2.

Rather than requiring you to pull information via our API, webhooks will **push** information to your endpoint. When one of those events is triggered (for example, a new deal is added), Pipedrive will send this notification as an HTTP `POST` request, with a JSON body, to the endpoint(s) you specify. 

The **maximum limit** of webhooks is **40 different webhooks per user**.  
  


* * *

## 

How to create webhooks v2 via API

[](#how-to-create-webhooks-v2-via-api)

* * *

When creating webhooks v2 via API, please ensure you add the `version` parameter to the webhook request body.

You will be able to see the v2 webhooks you’ve created in the Pipedrive web app via [_Settings > Tools and apps > (Tools) > Webhooks_](https://app.pipedrive.com/webhooks).

**`POST/v1/webhooks`**  
Creates a new Webhook and returns its details. Specifying an event that triggers the Webhook combines 2 parameters - `event_action` and `event_object`. E.g., use `*.*` for getting notifications about all events, `create.deal` for any newly added deals, `delete.persons` for any deleted persons, etc.

**Body parameters**  
`application/json`

|   
---|---  
subscription_url  
(string, required)| A full, valid, publicly accessible URL which determines where to send the notifications.NB: Pipedrive API endpoints cannot be used as the `subscription_url` and the chosen URL must not redirect to another link.  
event_action  
(string, required)| The type of [action](guide-for-webhooks-v2#supported-event-actions) to receive notifications about. Wildcard will match all supported actions. Values: `create`, `change`, `delete`, `*`  
event_object  
(string, required)| The type of [object](/docs/guide-for-webhooks-v2#supported-object-types) to receive notifications about. Wildcard will match all supported objects. Values: `activity`, `deal`, `lead`, `note`, `organization`, `person`, `pipeline`, `product`, `stage`, `user`, `*`  
version  
(string)| Webhook version. Values: `1.0`, `2.0`  
**NB** : If the `version` parameter value is not specified, `2.0` will be used as default.  
user_id  
(integer)| The ID of the user that this webhook will be authorized with. You have the option to use a different user's `user_id`. If it’s not set, the current user's `user_id` will be used.As each webhook event is checked against a user’s permissions, the webhook will only be sent if the user has access to the specified object(s). If you want to receive notifications for all events, please use a top-level admin user’s `user_id`.  
http_auth_user  
(string)| The HTTP basic auth username of the subscription URL endpoint  
http_auth_password  
(string)| The HTTP basic auth password of the subscription URL endpoint  
name  
(string)| The name of the webhook  
  
  


* * *

## 

Webhook format

[](#webhook-format)

* * *

JSON
    
    
    {
        "meta": {
            "action": "create",
            "entity": "deal",
            "company_id": "xxxxx",
            "correlation_id": "xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "entity_id": "xxx",
            "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "is_bulk_edit": false,
            "timestamp": "2023-01-01T00:00:00.000Z",
            "type": "general",
            "user_id": "xxxxx",
            "version": "2.0",
            "webhook_id": "xxx",
            "webhook_owner_id": "xxxxxx",
            "change_source": "app",
            "attempt": 1,
            "host": "company.pipedrive.com",
            "permitted_user_ids": ["123", "456", "789"], // present for entities other than 'user'
        },
        "data": ( the object data as of this update ),
        "previous": ( the previous data of the object fields that have been changed )
     }
    

See the explanations for the webhook meta block’s parameters [here](/docs/guide-for-webhooks-v2#webhooks-meta-block).

  


* * *

## 

`Attempt` field explanation

[](#attempt-field-explanation)

* * *

> ## 📘
> 
> For a successful delivery, we'll accept any 2XX status code.
> 
> Anything else is counted as a failure and the [retry policy](/docs/guide-for-webhooks-v2#retry-logic) will commence.

You can determine the number of delivery attempts according to the value of the `attempt` field in the payload (see the format [above](/docs/guide-for-webhooks-v2#webhook-format)). Learn about the retry logic below.

`Attempt` value| Value explanation  
---|---  
`1`| Webhook delivered on the first attempt  
`2`| Webhook delivered on the first retry  
`3`| Webhook delivered on the second retry  
`4`| Webhook delivered on the third retry  
  
  


* * *

## 

`Data` and `previous`

[](#data-and-previous)

* * *

In the `data` block, the standard data contains only crucial information about the entity and related/connected entities if their `id`s are provided. You can see the payload for webhooks v2 in the [migration guide here](/docs/webhooks-v2-migration-guide#webhook-v2-examples).

In the `previous` block, the standard data contains only the fields that have changed.

Action| Event action| Data| Previous  
---|---|---|---  
Deleting objects| delete| null| last state (object)  
Adding new objects| create| current state (object)| null  
Updating objects| change| current state (object)| previous state (object)  
  
  


* * *

## 

Webhook’s meta block

[](#webhooks-meta-block)

* * *

Parameter| Examples and explanations  
---|---  
`"action"`| See [supported event actions](/docs/guide-for-webhooks-v2#supported-event-actions)  
`"entity"`| See [supported object types](/docs/guide-for-webhooks-v2#supported-object-types)  
`"company_id"`| ID of the company where the webhook was triggered in  
`"correlation_id"`| Correlation ID for internal troubleshooting  
`"entity_id"`| ID of the object  
`"id"`| ID of the event triggering the webhook  
`"is_bulk_edit"`| Values are shown in boolean:

  * `true` \- trigger event originated from List view with bulk operation being used
  * `false` \- trigger event occurred after only one object was affected and the object wasn't affected by bulk operations

  
`"timestamp"`| 10 character timestamp  
`"type"`| Type of webhookValues are shown in string:

  * `general` for regular webhooks
  * `application` for Marketplace apps’ webhooks

  
`"user_id"`| ID of the user who triggered the webhook  
`"version"`| Webhooks version (in this case, it's version 2.0)  
`"webhook_id"`| ID of the webhook  
`"webhook_owner_id"`| ID of the user who owns the webhook  
`"change_source"`| Only the following 2 values are possible for this field:

  * `app` \- the webhook is triggered from the Pipedrive web app
  * `api` \- the webhook is triggered through the API

  
`"attempt"`| Retry attempt number. See [retry logic](/docs/guide-for-webhooks-v2#retry-logic) for more.  
`"host"`| `{COMPANYDOMAIN}.pipedrive.com`  
`"permitted_user_ids"`| Array of user IDs that can see the given entity. Only present for entities that are not of type "user".  
`"merged_to_id"`| A string value that is only present for delete events that were done as part of a merge action.  
`"merged_from_id"`| A string value that is only present for change events that were done as part of a merge action.  
  
  


* * *

## 

Supported event actions

[](#supported-event-actions)

* * *

  * `create`
  * `change`
  * `delete`

  


* * *

## 

Supported object types

[](#supported-object-types)

* * *

  * `activity`
  * `deal`
  * `lead`
  * `note`
  * `organization`
  * `person`
  * `pipeline`
  * `product`
  * `stage`
  * `user`



> ## 📘
> 
> View [list of webhooks v2](/docs/list-of-webhooks-v2) to see all available combinations of event objects and actions for creating webhooks.

  


* * *

## 

Examples and explanations

[](#examples-and-explanations)

* * *

It's possible to set up notifications for events like `added.organization`, `*.deal`, `updated.*`, `deleted.person`. When setting up notifications, note that event objects are not combinations but refer back to themselves.

  * For example, if you want a webhook for deal ownership changes, you should choose `deal` as the event object and `change` as the event action. If you pick `user` as the event object, the webhook will send notifications when things, such as the user’s personal data, have been changed.



You can see all possible webhooks v2 that can be created in Pipedrive [here](/docs/list-of-webhooks-v2).

  


* * *

## 

Status codes for Webhooks

[](#status-codes-for-webhooks)

* * *

You can see the status of the last attempt made by your webhook(s) in the webhook dashboard. The webhooks dashboard is available under _Tools and integrations > Webhooks_ inside Pipedrive.

There are three status code ranges or messages that are expected:

  * A `2XX` status code range shows a successful delivery of your webhook request.
  * A `500` status code indicates a server error, usually on the client side.
  * An `Error` status message is shown if there is a timeout of the webhook request, the webhook is blocked, or there is an internal problem on Pipedrive’s end. If you encounter this error, you can contact our support team, who can further inquire into the logs of these requests.



For a successful delivery, we'll accept any `2XX` status code. Any other code or message is counted as a failure, which means the retry logic and the webhooks policy will commence.

  


* * *

## 

Retry logic

[](#retry-logic)

* * *

Webhooks retry policy is as follows:

  * In case the original notification sending attempt fails (**due to receiving a non-`2XX` response code or exceeding timeout of 10 seconds**), we will try **3 more times** : after 3, 30 and 150 seconds. If it still fails for each of those attempts, it is counted as one non-successful delivery.
  * If there are no successful deliveries on 3 consecutive days, we will **delete** this specific webhook.



> ## 📘
> 
> Outgoing webhooks are **not** subject to our API rate limit.

* * *

## 

Webhooks policy

[](#webhooks-policy)

* * *

The webhooks policy is applied to both general and [App-Specific](/docs/webhooks-for-apps) webhooks. 

Pipedrive has a Ban System for webhooks, which means that every time the original notification sending attempt fails on the first try (due to receiving a non-`2xx` response code or exceeding a timeout of 10 seconds) the ban counter will increase by one.

When the ban counter reaches **10** on a webhook, this specific webhook will be banned for **30 minutes**. When the ban time is over, the webhook is reactivated, and the ban counter is set back to zero. 

  * If a webhook is unreachable on the first try, its ban count will increase, and the standard retry logic will be applied. If the webhook is unreachable during retries, the ban counter won’t be increased.
  * If a webhook is banned, the webhook’s event message is lost. No data will be saved for retries after the ban.



If there are **no** successful deliveries to a webhook on **3 consecutive days** , we will delete it.  
  


__Updated about 2 months ago

* * *
