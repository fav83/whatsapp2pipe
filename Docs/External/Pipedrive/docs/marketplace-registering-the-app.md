# Registering a public app

[ __Suggest Edits](/edit/marketplace-registering-the-app)

Requested a [developer sandbox account](https://developers.pipedrive.com/)? Ready with your app? Find out how to register your app and send it off for the [app approval process](/docs/marketplace-app-approval-process).

  * [How do I find Developer Hub to register my app?](/docs/marketplace-registering-the-app#how-to-find-developer-hub)
  * [What do I write in each tab of the app registration form in Developer Hub?](/docs/marketplace-registering-the-app#app-registration-form)
  * [Install and test your app before sending it for review](/docs/marketplace-registering-the-app#install-and-test-your-draft-app)
  * [Save your app to send it for review](/docs/marketplace-registering-the-app#save-your-app-and-send-it-for-review)



* * *

## 

How to find Developer Hub

[](#how-to-find-developer-hub)

* * *

First, go to _Settings_ by clicking on your profile name in the upper right corner of the top navigation bar. Find the company name of your sandbox account and choose _[Developer Hub](https://app.pipedrive.com/developer-hub)_ from the drop-down menu.

![2576](https://files.readme.io/a4b7881-How_to_find_Developer_Hub.png)

You must have a developer sandbox account for app creation to see Developer Hub. [Sign up here](https://developers.pipedrive.com/) if you don’t have one.

  


* * *

## 

Register a new public app

[](#register-a-new-public-app)

* * *

> ## 🚧
> 
> NB: Do pick your app type carefully, as it cannot be changed later on Developer Hub.

To register a new app, click on the green “Create an app” button (or “+ Create an app” if you have existing apps) followed by “Create public app”. This is also where you’d see a list of your registered public and private apps if you have any.

![Developer Hub - create a new app](https://files.readme.io/b54de13-Developer_Hub_-_create_an_app.png)   


* * *

## 

App registration form

[](#app-registration-form)

* * *

The app registration form for public apps is divided into two categories containing seven different tabs.

You can save your app anytime by clicking the green “Save” button. To exit the form and return to your Developer Hub dashboard, click the left-pointing arrow next to your app's name.

Read on to find out how and what to fill in each tab.

> ## 📘
> 
> **Disclaimer:** The Marketplace team reserves the right to make small changes to text fields and images uploaded to the app's listing to give the best possible user experience and make the page discoverable in search. You'll be notified when something is edited.

### 

Basic info

[](#basic-info)

![Developer Hub > public app - basic info](https://files.readme.io/8f6169e-Developer_Hub_-_public_app_-_Basic_info.png)

This tab has two required fields – App name and OAuth Callback URL. Once you’ve filled this in, click the green “Save” button to save the form. You’ll then automatically be brought to the second tab – “OAuth & access scopes”, where you’ll get your `client_id` and `client_secret`.

Field| Description  
---|---  
App name (required)| Insert your app’s name by how it will be recognized in the Marketplace.  
  
_Example: Car Services App_  
Callback URL (required, one URL per app)| Insert a link where an authorization code will be sent if the user approves or declines the installation of your app. This link is also where we return the user after successful authentication. Technically, a callback URL is the same thing as an OAuth `redirect_uri`.  
  
It’s okay to insert a non-functioning URL when creating a new app if you can update this field with a proper URL after implementing the logic needed to accept user authorization in your code. Please keep in mind that we allow only one callback URL per app.  
  
_Example:<https://www.carservicesapp.com/API/v2/callback>_  
  
### 

OAuth & access scopes

[](#oauth--access-scopes)

![Developer Hub > public app - OAuth & access scopes](https://files.readme.io/8086d43-Developer_Hub_-_public_app_-_OAuth__access_scopes.png)

Field| Description  
---|---  
Access scopes (required)| Using [scopes](/docs/marketplace-scopes-and-permissions-explanations), you can specify precisely what data access your application needs. Your selection will depend significantly on the endpoints you use in your app. You can also select the respective scope in this section if you are building a [manifest-based app extension](/docs/app-extensions#manifest-based-app-extensions).  
  
_Example:_  
✅ _Read users data_  
✅ _See recent account activity_  
Installation URL| This is where you can add an optional URL to which users will be redirected when clicking the “Proceed to Install” button in the marketplace listing page.  
  
Use it when you need to start [app authorization](/docs/marketplace-oauth-authorization#step-1-requesting-authorization) **outside** of the Marketplace, redirect users to a custom landing page, or implement the [state parameter](/docs/marketplace-oauth-authorization-state-parameter) for additional security.  
Client ID| This is where you will get your app’s unique `client_id` and `client_secret` for [OAuth authorization](/docs/marketplace-oauth-authorization).  
  
> ## 🚧
> 
> The user has the option to either **accept or deny all scopes**. Because of this, it’s a good idea to **build apps that only request necessary scopes** for your particular use case.

> ## 👍
> 
> Once you’ve completed filling up the Basic info and OAuth & access scopes, we advise you to **start installing your app and testing it** to see how it works. You can do so by clicking on the green “Install & test” button in the bottom left of the tab.

### 

App extensions

[](#app-extensions)

![Developer Hub - public apps > app extensions](https://files.readme.io/b3a7480-Developer_Hub_-_public_app_-_App_extensions.png)

App extensions let you extend Pipedrive’s user interface with your app’s functionality and content to let users do more in one place. Find out more about them [here](/docs/app-extensions).

Within Developer Hub, the app extensions tab is where you can add new app extensions and manage the ones you’ve added before. A modal with an app extension creation form will open when you click the button to add the respective app extension.

#### 

Link actions

[](#link-actions)

Learn more [here](/docs/app-extensions-actions).

Field| Description  
---|---  
Action name (required)| Insert your app action’s name that will be displayed in the Pipedrive UI. The name should be short, descriptive of the app action, and be in a sentence-case format.  
  
_Example: Send quote - Car Services_  
Action description| To showcase the interactive features of your app, your action’s name and description will appear in the Features section of your Marketplace app listing.  
  
Use the description field to let users know what they can do with this action.  
  
Optional; max 150 characters.  
URL link (required)| Add the URL that will redirect the user to the correct app page when an action is clicked. The URL must handle both scenarios of the user being logged into your app and not being logged in.  
  
_Example:<https://www.carservicesapp.com/handle_action>_  
[JWT](https://jwt.io/) secret| If left empty, `client_secret` will be used by default.  
Locations (one required)| Specify in which views the app action will be displayed. There can be a maximum of [3 app actions per app](/docs/app-extensions-actions#visibility-in-the-ui) or [custom modals](/docs/custom-ui-extensions-modals) in one view, altogether 21 (7 different views x 3 actions per view).  
  
_Example_ :  
✅ Activities list  
✅ Person details  
  
#### 

JSON modals

[](#json-modals)

Learn more [here](/docs/app-extensions-json-modals).

Field| Description  
---|---  
Action name (required)| The name of the JSON modal. The name should be short (max 30 characters), actionable, and sentence-cased (only capitalize the first word).  
  
_Example: + Prod. details - Car Services_  
Action description| To showcase the interactive features of your app, your action’s name and description will appear in the Features section of your Marketplace app listing.  
  
Use the description field to let users know what they can do with this action.  
  
Optional; max 150 characters.  
API endpoint (required)| All API requests related to this action will be sent to this URL.  
  
_Example:<https://www.carservicesapp.com/handle_action>_  
[JWT](https://jwt.io/) secret| If left empty, `client_secret` will be used by default.  
JSON schema (required)| The [JSON schema](/docs/app-extensions-json-modals#schema) for your JSON modal.  
Locations (one required)| There can be a maximum of 3 app actions or custom modals per location. Each app can have a total of 21 app actions. See more available locations in [app actions’ visibility](/docs/app-extensions-actions#visibility-in-the-ui).  
  
_Example: Deal details_  
  
#### 

JSON panels

[](#json-panels)

Learn more [here](/docs/app-extensions-json-panels).

Field| Description  
---|---  
Panel name (required)| Insert your JSON panel’s name that will be displayed in the Pipedrive UI. The JSON panel’s name should be descriptive and have a maximum of 30 characters.  
  
_Example: Car PM – Car Services_  
Panel description| To showcase the interactive features of your app, your panel’s name and description will appear in the Features section of your Marketplace app listing.  
  
Use the description field to let users know what they can do within this panel.  
  
Optional; max 150 characters.  
API Endpoint (required)| The URL of the endpoint which we’ll use to fetch the data of the object properties  
  
 _Example:[www.api.pipedrive.com/deal-view/visits](http://www.api.pipedrive.com/deal-view/visits)_  
HTTP Auth username (required) and HTTP Auth password (required)| Our service will send the HTTP request with these credentials as the Basic Authentication header to protect your data. To protect your data, we strongly recommend using authenticated HTTPS requests. Note that we do not support self-signed certificates.  
[JWT](https://jwt.io) secret| JWT is required **if** HTTP Auth is not provided.  
JSON data structure (required)| A JSON file that describes the structure of your JSON panel as seen in the Pipedrive UI. See [here](/docs/json-panels-adding-a-panel#json-data-structure) for more information.  
Panel locations (one required)| Choose where the panel will be displayed:  
– Deal details  
– Person details  
– Organization details  
  
Each app can have one JSON or custom panel in each location.  
  
#### 

Custom modals

[](#custom-modals)

Learn more [here](/docs/custom-ui-extensions-modals).

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
  
If no entry points are selected, the only way to open a modal is via the [SDK](https://github.com/pipedrive/app-extensions-sdk). You can have a maximum of three app extensions per location.  
  
Each app can have a total of 21 custom modals or app actions.  
  
#### 

Custom panels

[](#custom-panels)

Learn more [here](/docs/custom-ui-extensions-panels).

Field| Description  
---|---  
Panel name (required)| The name of your custom panel. Descriptive, max 30 characters and should be sentence-cased (only capitalize the first word).  
Panel description| To showcase the interactive features of your app, your modal’s name and description will appear in the Features section of your Marketplace app listing.  
  
Use the description field to let users know what they can do within this panel.  
  
Optional; max 150 characters.  
Iframe URL (required)| URL of the web content to be shown within the iframe  
– Please ensure your iframe URL uses **HTTPS**  
[JWT](https://jwt.io) secret| Optional. Defaults to `client secret`  
Panel locations (one required)| Choose where the custom panel will be displayed:  
– Deals details view  
– People details view  
– Organizations details view  
  
Each app can have one custom or JSON panel in each location.  
  
#### 

Custom floating window

[](#custom-floating-window)

Learn more [here](/docs/custom-ui-extensions-floating-window).

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
  
#### 

App settings page

[](#app-settings-page)

Learn more [here](/docs/custom-ui-extensions-app-settings).

Field| Description  
---|---  
Type| Choose how you want your app’s user to access their app settings  
– External link  
– Custom UI  
URL (required) – for external link| Add the URL that will redirect the user to your app settings page  
Iframe URL (required) – for custom UI| URL of the web content to be shown within the iframe  
– Please ensure your iframe URL uses **HTTPS**  
[JWT](https://jwt.io/) Secret – for Custom UI| Optional. Defaults to `client secret`.  
  
> ## 👍
> 
> Do **install and test** your app after you add app extensions to see how it works for your users.

  


### 

Onboarding for users

[](#onboarding-for-users)

With the user onboarding guide, you can onboard users to your app with step-by-step instructions or a feature review to improve app adoption and drive more customers. The guide will appear once users install the app and return to Pipedrive (web app reload is required). Users can access the guide at any time from the app page (Settings → Tools and apps → Marketplace apps).

> ## 🚧
> 
> To publish the onboarding guide, your app needs to pass our [app approval process](/docs/marketplace-app-approval-process). Once it's approved, you can edit it any time without approval process.

The guide is a separate step in the app creation flow in Developer Hub (App Settings → Onboarding for users).

![](https://files.readme.io/9883b7e-Navigation.png)

#### 

Content blocks

[](#content-blocks)

Use content blocks to break your guide into individual segments, either to introduce separate individual features or to guide the user through sequential steps.

##### 

Tips for content blocks:

[](#tips-for-content-blocks)

  * Make sure the guide is simple to follow.
  * If your app has multiple features or steps, select the crucial ones and add a link to an in-depth guide.
  * If your guide lists instructions in a specific order, pay attention to the chronological sequence.
  * Use arrows to indicate a series of actions. _Example: Click “Start” → Select your plan → Check the checkbox to continue._
  * Update the onboarding guide when making changes to your app’s flow.



Open the content block and fill out the necessary information.

![](https://files.readme.io/c9961fe-Content_block.png)

Field| Description  
---|---  
Title | Write a short title that summarizes the functionality or onboarding step (max 70 characters). The title will appear as the text block header.  
  
_Example: Manage car orders straight from the deal view_  
Description| Provide a clear and concise overview of the feature and its location or instructions for this step (max 200 characters). The text block description will appear on the modal’s main text block under the title.  
  
_Example: Navigate to a deal detail view and head to the side panel. You can add new orders, see all linked car orders and manage their details_  
Learn more link (optional)| Here, you can add any additional info about this step with a link to an external page related to it. The page will open in a new tab.  
  
_Example:<https://support.carprojectmanagerapp.com/en/article/pipedrive-integration-setup>_  
Image| Add an image to illustrate this feature or onboarding step and indicate its location on the screen.  
  
**Image requirements:**  
Format: PNG, JPG  
Max size: 100KB  
Aspect ratio: 9:5  
Width and height: 720 x 400  
Have purple borders (20px)  
  
##### 

Tips for image content: 

[](#tips-for-image-content)

  * The image should contain as little text as possible. Replace text elements with gray blocks wherever possible.
  * Prioritize important information so as not to overwhelm users and keep them focused.
  * Highlight crucial information with a bright color, different font weight or your own highlighting style.
  * Avoid red and yellow color palettes whenever possible. These are associated with error and warning states and may disrupt and confuse users.
  * Optimize image size for web content. The smaller the image size, the quicker it will load for the user. 



* * *

To add an additional content block, click the “+ Add a content block” button below the list. You can include up to four blocks and change their position by dragging them up or down. You can delete any of your blocks by clicking the recycle bin icon.

![](https://files.readme.io/8a5e662-New_drag_delete.png)

* * *

#### 

Additional info

[](#additional-info)

##### 

Video link and info

[](#video-link-and-info)

> ## 👍
> 
> **Tip:** To improve your guide and increase app adoption, consider including an onboarding tutorial video link that will show your app’s features and functionality. The video will open within Pipedrive.

![](https://files.readme.io/f6bed97-Add_video_link.png) ![](https://files.readme.io/cf630e0-Video_modal.png)

Field| Description  
---|---  
Video link| The video should demonstrate your onboarding process or the most important features of your solution, helping new users get started using your tool.  
  
We currently support links to the following video hosting platforms: YouTube, Vimeo, Vidyard and Wistia.  
  
**General guidelines:**  
The video should be 1 to 3 minutes long. This duration allows you to demonstrate key features and guide users through the initial steps without overwhelming them with excessive information. Keeping the video short and focused will help maintain user engagement and ensure they absorb the most important bits quickly and effectively.  
  
If your app integrates Pipedrive with another tool, your video should clearly explain your solution’s benefits and unique features.  
  
_Example:<https://youtu.be/5a7OzJBG3kk?si=eN2c5W>_  
Video title (optional)| The video title should be short (max 80 characters) and descriptive. It will be displayed as the text block’s title at the bottom of the video player overlay.  
  
_Example: Get started with Car Project Managers app in Pipedrive_  
Video description (optional)| The video description should clearly describe the video’s content and what the viewer can gain from watching it (max 120 characters).  
  
It will be displayed as the body text block at the bottom of the video player overlay.  
  
_Example: Watch this explanatory video on how to get started with this app and where to find the key functionalities._  
  
* * *

##### 

Learn article link

[](#learn-article-link)

Optional: Add an onboarding article link. The article will open in a new tab.

![](https://files.readme.io/50e5e0b-Add_Learn_link.png) ![](https://files.readme.io/b39d063-Learn_modal.png)

Field| Description|   
---|---|---  
Learn article link| Add a link to an article about your onboarding flow or features overview. The article should explain either the first steps users need to take to experience the benefits of your tool or delve into your app’s key features.  
  
_Example:<https://support.carprojectmanagerapp.com/en/article/pipedrive-integration-winbridge>_|   
| |   
  
> ## 👍
> 
> Once you've filled in your relevant information, click on the green "Preview" button at the bottom to preview your app onboarding guide and make sure everything is like it should.

The onboarding guide preview displays how your app will look after filling out the required fields.

![](https://files.readme.io/0648561-Modal_Details.png)   


### 

General info

[](#general-info)

![Developer Hub > public app - general info](https://files.readme.io/632bd0b-Developer_Hub_-_public_app_-_General_info.png)

**Basic info**

Field| Description  
---|---  
Built by| This will be the name of the company responsible for developing the app. It will appear publicly on the Pipedrive Marketplace.  
  
To change the company name, click “edit” under the company name, and you’ll be taken to Company settings.  
  
_Example: Car Services Inc_  
App category (required)| Choose categories from the drop-down menu that best represent your app’s use case.  
  
_Example: Task and workflow management_  
Short summary (required)| Summarize the essence of what your app does. It will be shown in the list views and other places where the full description cannot be shown in the Marketplace. Max 150 characters.  
  
Please include your app’s name and “Pipedrive” in the description if possible.  
  
_Example: Car Services app helps you better manage your orders and workflows in Pipedrive and automatically syncs it across both platforms._  
  
**App images**

> ## ⚠️
> 
> Pipedrive supports **light and dark theme**! Please make sure all content is visible from light and dark backgrounds. You can switch themes in [Interface preferences](https://app.pipedrive.com/settings/interface-preferences). If your images are not well visible on both, we recommend uploading images with a white background.

Field| Description  
---|---  
App icon (required)| Upload an icon that best represents your app (be aware of the file type and sizing requirements).  
  
Icon criteria:  
– PNG, JPG  
– 1:1 aspect ratio  
– min 256x256 px  
– max 10 MB  
  
We recommend uploading an icon-only version as your logo is sometimes presented in a minimal size of 20x20px alongside your app name.  
  
_Tip: To make your app listing more SEO-friendly, name your app icon file “ting how the app -pipedrive-integration”. For example, “carservices-pipedrive-integration” - all lowercase with dashes._  
App listing images (1 required, max 5)| Upload max five images that should be helpful to users by illustrating how the app works, highlighting key areas and demonstrating the general flow process.  
  
Image criteria:  
– PNG, JPG  
– 16:10 aspect ratio  
– max 10 MB  
– 1280x800, 1440x900, 2560x1600 or 2880x1800 pixels – the bigger, the better!  
  
_Tip: To make your app listing more SEO-friendly, add numbers to the end of your image file's name. For example, “y areas and demon-pipedrive-integration-1”:  
– “carservices-pipedrive-integration-1”  
– “carservices-pipedrive-integration-2”, etc._  
  
**App description**

Field| Description  
---|---  
Full description (required)| Clearly state what your app does and why the integration with Pipedrive is useful. It needs unique text tailored explicitly for the Pipedrive Marketplace to avoid being marked as double content by search engines. Max 1500 characters.  
  
If you have done your keyword research, please use SEO keywords throughout this section. If not, here are some SEO keyword recommendations that you can use:  
– “(Your app’s name) app”  
– “(Your app’s name) CRM”  
– “(Your app’s name) integration”  
– “(Your app’s name) Marketplace”  
– “(Your app’s name)-Pipedrive integration” (_e.g. “Car Services-Pipedrive integration”_)  
– “Pipedrive (your app’s category) integration” (_e.g. “Pipedrive task and workflow management integration”_)  
  
Please [reach out to the Marketplace team](/cdn-cgi/l/email-protection#afc2ceddc4cadbdfc3ceccca81cbcad9dcefdfc6dfcacbddc6d9ca81ccc0c2) if you need some SEO assistance.  
  
_Example: Discover the Car Services-Pipedrive integration that helps you manage your orders and workflows! The Car Services app has received many excellent user reviews, among them Quinn Smith’s feedback:  
"It feels so empowering to be able to easily access my orders and sales reports and have them automatically synced between Pipedrive and Car Services!"_  
YouTube video link (one link)| Add a link to a video that depicts the capabilities of your app with a specific demonstration of how it works together with Pipedrive. We recommend you use the video for marketing your app.  
  
We currently support only Youtube video links.  
  
> ## 👍
> 
> Once you’ve filled in your relevant app information, click on the green “Preview” button at the bottom to **preview your app listing page and make sure the information is accurate**. The draft app listing will open in a hovering window.

### 

Setup and installation

[](#setup-and-installation)

![Developer Hub > public app - setup and installation](https://files.readme.io/1eb506b-Developer_Hub_-_public_app_-_Setup_and_installation.png)

Field| Description  
---|---  
Instructions for users (max 1500 characters)| What should users do after they click “Install now”? What should they expect to see, and where should they navigate to next?  
  
List step-by-step instructions so existing users can quickly get started with your app and new users can understand the required level of effort.  
  
If you have done your keyword research, please use SEO keywords throughout this section. If not, here are some SEO keyword recommendations that you can use:  
– “(Your app’s name) app”  
– “(Your app’s name) CRM”  
– “(Your app’s name) integration”  
– “(Your app’s name) Marketplace”  
– “(Your app’s name)-Pipedrive integration” (_e.g. “Car Services-Pipedrive integration”_)  
– “Pipedrive (your app’s category) integration” (_e.g. “Pipedrive task and workflow management integration”_)  
  
In case a one-on-one set up is required, define in this section who should be contacted and how.   
  
> ## 👍
> 
> Once you’ve filled in your relevant app information, click on the green “Preview” button at the bottom to **preview your app listing page and make sure the information is accurate**. The draft app listing will open in a hovering window.

### 

Support and legal info

[](#support-and-legal-info)

![Developer Hub > public app - support and legal info](https://files.readme.io/d6f34d5-Developer_Hub_-_public_app_-_Support_and_legal_info.png)

**Main resources**

Field| Description  
---|---  
Website URL (required)| Insert a link to your app’s website.  
  
_Example:<https://www.carservicesapp.com>_  
Terms of Service URL (required)| Insert a link to your app’s Terms of Service webpage with rules that users must agree to abide by to use your service/app.  
  
_Example:<https://www.carservicesapp.com/termsofservice>_  
Privacy Policy URL (required)| Insert a link to your app’s Privacy Policy webpage of a legal document that has most or all the information of how users’ data is gathered, used, communicated and managed.  
  
_Example:<https://www.carservicesapp.com/help/privacypolicy>_  
  
**Additional resources**

Field| Description  
---|---  
Pricing page URL| Insert a link to your app’s pricing page.  
  
_Example:<https://www.carservicesapp.com/pricing>_  
Support URL| Insert a link to your app’s support website’s main page, where a user with questions/problems can find answers about different support channels and their [SLA](https://cybernews.com/resources/web-hosting-glossary/#sla)s, FAQs, self-service support resources, and maybe even discover tips and tricks about your app, or get general help.  
  
_Example:<https://www.carservicesapp.com/support>_  
Support email| Insert an email address for your app’s Support contact if the user needs direct help.  
  
_Example:[[email protected]](/cdn-cgi/l/email-protection#5d2e282d2d322f291d3e3c2f2e382f2b343e382e3c2d2d733e3230)_  
Documentation URL| Insert a link to your app’s documentation website from where the user can familiarize themselves with your app’s features: a detailed description of what your app can do and how, tutorials/articles for getting started or specific use cases, etc.  
  
_Example:<https://www.carservicesapp.com/help>_  
Issue tracker URL| Insert a link to your issue tracker website, where users can report bugs or any other issues noticed when using your app.  
  
_Example:<https://gitzhubz.com/carservicesapp/issues>_  
  
> ## 👍
> 
> Once you’ve filled in your relevant app information, click on the green “Preview” button at the bottom to **preview your app listing page and make sure the information is accurate**. The draft app listing will open in a hovering window.

### 

App review info

[](#app-review-info)

![Developer Hub > public apps - app review info](https://files.readme.io/b0d3202-Developer_Hub_-_public_app_-_App_review_info.png)

Field| Description  
---|---  
Main contact email (required)| The main point of contact to receive  
– Results and comments of the app review  
– Notifications about user reviews  
– Technical updates and notifications from Pipedrive  
Use case| Please clearly state what problem(s) your app solves and how. This info is not public and will only be displayed to the app reviewer. Max 350 characters.  
Installation flow recording URL| Optional. If possible, please include a recording link to show how your app has covered the **mandatory** installation flows:  
– A user does not have an account with you and installs the app _(Installation runs through the process of creating an account and finishes the app install)_  
– A user does have an account with you but isn’t logged in and installs the app _(Installation runs through login on your side and finished the app install)_  
– A user has an account with you, is logged in, and installs the app _(Installation recognizes the user is logged in and finishes the app install)_  
  
Find out more about [app installation flows](/docs/app-installation-flows)  
  
> ## 🚧
> 
> To be published on the Marketplace, your app needs to pass our [app approval process](/docs/marketplace-app-approval-process).

  


* * *

## 

Install and test your draft app

[](#install-and-test-your-draft-app)

* * *

Installing and testing your draft app is a **crucial step** before sending your app for review. It enables you to

  * Ensure everything in your app runs smoothly
  * Check that you've implemented the [**mandatory** installation flows](/docs/app-installation-flows)
  * Identify and address potential issues early on
  * Pass our app approval process faster



NB: app testing only works for users in your sandbox account and cannot be shared with external users.

To install and test your app, click the “Install and test” notification above your app’s name or the “Install & test” option from the three-dot menu.

![Developer Hub > public app - install & test](https://files.readme.io/02b82c9-Developer_Hub_-_Public_app_-_install_and_test.png)

You can also click the green “Install & test” button at the bottom left of the OAuth & access scopes and App extensions tabs.

![Developer Hub > public app - install & test from the OAuth & access scopes tab](https://files.readme.io/ed7ea90-Developer_Hub_-_Public_app_-_Install__test_-_OAuth__access_scopes.png)

You will then be brought to the OAuth confirmation dialog where you can allow and install your app to begin testing it.

* * *

## 

App listing in the Marketplace

[](#app-listing-in-the-marketplace)

* * *

This is how your app’s info from General info, Setup and installation and Support and legal info tabs in Developer Hub will be converted to the app listing page in the Marketplace.

![](https://files.readme.io/c394389-App_Details.png)   


* * *

## 

Save your app and send it for review

[](#save-your-app-and-send-it-for-review)

* * *

Ready with your app? Send it for review by agreeing to the terms and conditions of the [Pipedrive Developer Partner Agreement](/docs/marketplace-vendor-agreement) and clicking on the green “Send to review” button.

You will then be asked to provide us with any test account information or details that the Marketplace team should know to properly install and test your app during approval.

![Developer Hub > public app - provide test account info](https://files.readme.io/d26e090-Developer_Hub_-_public_app_-_test_account_info.png)

The final step involves confirming your email address – a requirement for all public apps. You will receive the confirmation email in the main contact email you specified. Once you’ve confirmed your email address, your app will be sent to the Marketplace team for review, and its status in the Developer Hub dashboard will be changed to “In review”.

![Developer Hub > public app - confirm your email](https://files.readme.io/5d8d45e-Developer_Hub_-_public_app_-_email_confirmation_modal.png)   


* * *

## 

App status

[](#app-status)

* * *

The status of your app is displayed in a pill next to your app’s name in Developer Hub.

![Developer Hub - apps list](https://files.readme.io/814016e-Developer_Hub_dashboard_-_apps_list.png)

Public apps can have four different statuses:

App status| Description  
---|---  
![App status - draft](https://files.readme.io/919b4df-Developer_Hub_-_app_status_-_draft.png)| Your app is in a draft state. Please start installing and testing it before sending it for review.  
![App status - review](https://files.readme.io/0bc4153-Developer_Hub_-_app_status_-_review.png)| Your app has been sent for review and is being reviewed by the Marketplace team.  
![App status - unpublished](https://files.readme.io/4aef7c6-Developer_Hub_-_app_status_-_unpublished.png)| Your app is approved by the Marketplace team. It remains unpublished as you have to publish it yourself.  
![App status - published/live](https://files.readme.io/cd5e758-Developer_Hub_-_app_status_-_published_-_live.png)| Your app is published and publicly visible in the Pipedrive Marketplace.  
  
  


* * *

## 

What happens after my app is approved?

[](#what-happens-after-my-app-is-approved)

* * *

After your app is approved, its status will be changed to “Unpublished” as you have to publish it yourself. To publish your app, go to the three-dot menu next to your approved app’s name and click “Publish”.

![Developer Hub > public apps - publish approved app](https://files.readme.io/3178c50-Developer_Hub_-_public_app_-_Unpublished_app_dropdown.png)

Congratulations, your app is now publicly available in the Pipedrive Marketplace!

__Updated 5 months ago

* * *

Read next

  * [App installation flows](/docs/app-installation-flows)
  * [App Approval Process](/docs/marketplace-app-approval-process)
  * [Updating the existing app](/docs/marketplace-updating-the-existing-app)
  * [Article: Get your Pipedrive Marketplace app approved on the first review](https://medium.com/pipedrive-engineering/getting-your-marketplace-app-approved-on-the-first-review-is-it-even-possible-628b7e5eca47)


