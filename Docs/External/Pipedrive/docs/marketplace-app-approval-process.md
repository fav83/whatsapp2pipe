# App approval process

[ __Suggest Edits](/edit/marketplace-app-approval-process)

> ##  🚧
> 
> Heads up! Due to a surge in demand and ongoing vacations, public app reviews may take up to 21 business days. Thank you for your patience!

> ## 📘
> 
> Throughout the process, if you encounter difficulties, you can contact us via [[email protected]](/cdn-cgi/l/email-protection#e08d81928b8594908c818385ce84859693a0908990858492899685ce838f8d) to ask for assistance.

Apps allow developers like you to add value to the lives of salespeople using Pipedrive. It doesn’t matter if you’re new to developing or have been doing it for years; we’re happy you’ve decided to join our forces.

To enable your app to get through our approval process quickly without any obstacles, it’s important that you fully understand the process. This way, you’ll have the utmost confidence when you submit your app to the Pipedrive Marketplace.

Jump to [the checklist](/docs/marketplace-app-approval-process#before-you-submit--a-checklist)!

  


* * *

## 

Introduction

[](#introduction)

* * *

> ## 🚧
> 
> Submitting the app is unnecessary if it’s only used internally. You can instead [create a Private app](/docs/marketplace-registering-a-private-app) and share it with any Pipedrive company using a direct installation link

After you have built and tested your app, submit your app to start the approval process. Each new public app submitted to the Pipedrive Marketplace has to pass our approval process to ensure the standards of quality and reliability that our customers (the salespeople) expect.

Here’s a high-level graph of the approval process: 

![1000](https://files.readme.io/8d81ddd-approval_process.png)   


* * *

## 

Approval process overview

[](#approval-process-overview)

* * *

**Steps before starting the approval process**

  * Request [a developer sandbox account](https://developers.pipedrive.com/) to get access to the Developer Hub
  * Review and understand the requirements of [the Pipedrive Developer Partner Agreement](/docs/marketplace-vendor-agreement)



**Steps to start the approval process**

  * Log into your Pipedrive account and go to _[Settings> (company name) Developer Hub](https://app.pipedrive.com/developer-hub)_
  * Create the app listing by filling out the form for [registering a new app](/docs/marketplace-registering-the-app#app-registration-form)
  * Install and test your app to see how it works
  * Preview your app listing and check that the information is accurate
  * Click on “Send to review”



**What happens next?**

Your app will be tested thoroughly, from the [app installation flows](/docs/app-installation-flows) to its actual functionality (and everything else in between). Ensure your app sticks to **the following checklist** to speed up the process and avoid resubmissions. You can also check out [this article](https://medium.com/pipedrive-engineering/getting-your-marketplace-app-approved-on-the-first-review-is-it-even-possible-628b7e5eca47) for tips and tricks on how to get your app approved on the first review.

  


* * *

## 

Before you submit – a checklist

[](#before-you-submit--a-checklist)

* * *

> ## 🚧
> 
> These requirements may change as we continuously enhance our marketplace and developer platform

To ensure that the apps submitted to our marketplace meet the highest standards and provide value to our customers, we have compiled a list of mandatory guidelines for you to follow. 

Following these guidelines will reduce the need for resubmissions, speed up the review process and ultimately increase the likelihood of successful app approval in the first review.  
  


### 

Marketplace listing

[](#marketplace-listing)

* * *

#### 

General

[](#general)

  * Your selected app categories reflect the main **use cases** of the app
  * Your app name is unique and isn’t similar to another app in the Marketplace
  * Your app name does not convey false information, such as leading customers to believe that Pipedrive developed the app
  * The app **short summary** contains a value proposition for the customer and **clearly conveys** what your app does
  * The app **full description** is **specific to your integration** , well-written and has a comprehensive overview of what the app does and how it works with Pipedrive
  * The app listing uses white space, bullet points, rich text functionality and clear paragraphs in a logical order
  * If your app focuses on non-English speaking markets, your app listing page includes a disclaimer at the top stating that the app works only in specific markets or in a particular language
  * No advertisements of other apps, products or services in your listing or app extensions



#### 

Setup and Installation

[](#setup-and-installation)

  * The app provides helpful and accurate **step-by-step installation instructions** to existing customers and newcomers, with a clear understanding of the effort and flows required to use the app



#### 

Support

[](#support)

  * Your team is ready to provide **customer support** and your app includes the necessary contact details and links in the listing
  * Your team has the necessary processes in place for monitoring, replying to [reviews and ratings](about-the-marketplace.md#ratings-and-reviews-in-the-pipedrive-marketplace), and addressing any concerns, questions, or feedback



#### 

Pricing

[](#pricing)

  * Your app listing includes a link to a separate pricing page that includes information about available plans or rates for your tool 



#### 

Media content

[](#media-content)

  * Your app has a distinctive icon that does not resemble Pipedrive’s or any other on the Marketplace
  * Your media content does not include sensitive information, such as personal contact details or access tokens
  * The app icon should be of high quality and suitable for display on a [dark background](https://www.pipedrive.com/en/blog/dark-theme)
  * Your app listing includes **3-5 high-quality images** that are easily readable and include assistive cues, such as annotations and highlights, illustrating how the app works in conjunction with Pipedrive
  * If your app listing includes a demonstration video, it needs to visualize and communicate the experience of using your tool and educate prospective customers about the value it brings

  


### 

User experience

[](#user-experience)

* * *

#### 

Registration

[](#registration)

  * If your app does not allow **self-service registration** and one-on-one setup is required, mention who should be contacted and how



#### 

Installation

[](#installation)

  * No other public or private apps will be installed for the user, except the one listed
  * When starting the [authorization process](marketplace-oauth-authorization.md), the user experiences a seamless and uninterrupted flow from beginning to end
  * Once installation is complete, the customer is redirected back to Pipedrive or an appropriate onboarding page in your app



#### 

Onboarding for users

[](#onboarding-for-users)

  * The app should be easy and **convenient for all new users** , offering an [onboarding guide](marketplace-registering-the-app.md#onboarding-for-users) after installation



#### 

Distribution

[](#distribution)

  * In case your app requires a separate extension, add-on or desktop app to function, ensure that they are approved and distributed through a trusted marketplace

  


### 

Technical requirements

[](#technical-requirements)

* * *

#### 

General

[](#general-1)

  * Your app implements and primarily uses [OAuth 2.0](marketplace-oauth-api.md) for both authentication and [request authorization](marketplace-oauth-authorization.md)
  * Your app does not collect, store, or unnecessarily use the [API token](how-to-find-the-api-token.md) of a user
  * Your app [refreshes the access token](marketplace-oauth-authorization.md#step-7-refreshing-the-tokens) once its 60-minute lifetime expires
  * Your app only requests necessary [scopes and permissions](marketplace-scopes-and-permissions-explanations.md) for your particular use case and functionality
  * Your app has polished and properly tested [installation](app-installation-flows.md) and [uninstallation](app-uninstallation.md) flows
  * Your app correctly handles different [user types](https://support.pipedrive.com/en/article/types-of-users-in-pipedrive) and [permissions sets](https://support.pipedrive.com/en/article/permission-sets)



#### 

Performance

[](#performance)

  * Your app respects and adheres to [rate limiting](core-api-concepts-rate-limiting.md) and does not abuse our public API
  * When possible, your app uses [v2 webhooks](guide-for-webhooks-v2.md) for efficient and nearly real-time data synchronization
  * Your app doesn’t cause significant performance issues for the user’s Pipedrive account
  * Your app is ready to support a large number of users after it is listed in the Marketplace
  * Your app has resources allocated for further maintenance and prompt updates in case of [breaking changes to our API](changes-to-the-api.md)



#### 

App extensions

[](#app-extensions)

  * The content of [app extensions](app-extensions.md) correctly loads and does not fail with a global “Something went wrong” error message
  * All action buttons within app extensions are responsive, trigger other elements and correctly redirect to specified URLs
  * App extensions correctly handle different [user interactions](json-modals-user-interaction-handling.md) and display appropriate error messages when requests cannot be fulfilled
  * App extensions support different [interface preferences](https://support.pipedrive.com/en/article/quick-actions-in-pipedrive#customizing-pipedrive), such as dark or light themes



#### 

App sharing

[](#app-sharing)

  * If [requested](app-sharing-adding-apps-to-multiple-users.md) to be enabled for your app, ensure that multiple users can authorize the app within the same company

  


### 

Legal

[](#legal)

* * *

  * You agree with [the Pipedrive Developer Partner Agreement](marketplace-vendor-agreement.md)
  * Your app has a Terms of Service webpage with clearly stated rules that users must agree to abide by to use your service
  * Your app has a Privacy Policy webpage of a legal document with most or all the information on how users’ data is gathered, used, communicated and managed
  * Your app does not infringe on trademarks or copyrights of Pipedrive or any other product
  * No spam is sent to the emails retrieved from the connected Pipedrive account

  


### 

App review

[](#app-review)

* * *

  * Provide our team with a demo video in which you explain the usage of permissions and scopes, as well as demonstrate the key functionality of your app
  * Provide our team with fully functional and up-to-date test accounts that we will use to properly asses your app and its functionality with Pipedrive
  * Provide our team with a contact that is available for communications regarding questions during the approval process, future co-marketing initiatives and updates to our developer-facing platforms

  


### 

Other

[](#other)

* * *

  * Become a member of our [Developers’ Community](https://devcommunity.pipedrive.com) for future correspondence

  


* * *

## 

Preview your listing

[](#preview-your-listing)

* * *

![An example of an app listing preview in Developer Hub](https://files.readme.io/c24c0c6-cd22524-Developer_Hub_-_app_listing_preview.png)

An example of an app listing preview in Developer Hub

Before submitting, you can preview your app’s listing page in Pipedrive’s Marketplace via [Developer Hub](https://app.pipedrive.com/developer-hub). To do so, go to Developer Hub, click on your app’s name and head to the General info, Setup and Installation or Support and legal info tab. You’ll find a green “Preview” button towards the bottom left of the page that allows you to preview your app listing.

![](https://files.readme.io/03ee6ce-d68c8db-Developer_Hub_-_public_app_-_preview_Marketplace_app_listing.png)   


* * *

## 

After you submit – what to expect?

[](#after-you-submit--what-to-expect)

* * *

**Status update:**

  * Your app’s status will change in Developer Hub
  * You’ll receive an email confirming that we’ll start reviewing it
  * If there are any questions from our side, your main contact person should be reachable via email



**Approval:**

  * You’ll be notified via email when the app is approved
  * The status will also change in the Developer Hub



**Rejection:**

  * You’ll be notified via email if the app is rejected
  * The status will also change in the Developer Hub
  * The reason(s) for rejection will be made clear in the notification email
  * Before the app can be submitted again, you’ll need to resolve the reason(s) for the rejection



**Release Date:**

  * The app is unlisted from the Marketplace by default after approval. If you wish to have it published, you will need to go to “...” next to your approved app’s name in Developer Hub and click on “Publish”.  
[What if you can't see the 'Publish' button?](/docs/faq#why-cant-i-see-the-green-publish-button-in-marketplace-manager)



We’re looking forward to seeing what you’ve built for Pipedrive!  
  


__Updated 7 months ago

* * *

Read next

  * [OAuth 2.0 overview](/docs/marketplace-oauth-api)
  * [Registering the app](/docs/marketplace-registering-the-app)
  * [Article: Get your Pipedrive Marketplace app approved on the first review](https://medium.com/pipedrive-engineering/getting-your-marketplace-app-approved-on-the-first-review-is-it-even-possible-628b7e5eca47)


