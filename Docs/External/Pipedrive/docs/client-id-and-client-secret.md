# Client ID and client secret

[ __Suggest Edits](/edit/client-id-and-client-secret)

Your app’s unique `client_id` and `client_secret` are values you need to go through [OAuth authorization](/docs/marketplace-oauth-authorization) and receive the `access_token` and `refresh_token` to be used in API requests.

  


* * *

## 

How to get your `client_id` and `client_secret`

[](#how-to-get-your-client_id-and-client_secret)

* * *

### 

New apps

[](#new-apps)

![Create an app in Developer Hub](https://files.readme.io/19a5c0e-Developer_Hub_-_create_an_app.png)

  1. [Log in to Developer Hub on your developer sandbox account](https://app.pipedrive.com/developer-hub)
  2. Click on “Create an app”
  3. Choose whether you would like to create a public or private app
  4. In the Basic Info tab of Developer Hub, fill in the required fields – App name and OAuth Callback URL 
     * You can insert a non-functioning OAuth Callback URL for the time being. After implementing the logic needed for accepting user authorization in your code, you must update the field with a proper URL.
     * Keep in mind that we allow only one callback URL per app
  5. Click the green “Save” button to save the form
  6. You’ll automatically be brought to the second tab, “OAuth & access scopes”, where you’ll get your `client_id` and `client_secret`



> ## 📘
> 
> **Take note** : If you initially inserted a non-functioning OAuth callback URL, make sure you change it to a functioning one before submitting it for approval.

### 

Existing apps

[](#existing-apps)

  1. [Log in to Developer Hub on your developer sandbox account](https://app.pipedrive.com/developer-hub)
  2. Click on your app name and go to the “OAuth & access scopes” tab
  3. Scroll down to the Client ID section to find your `client_id` and `client_secret`

  


* * *

## 

How to refresh your `client_secret`

[](#how-to-refresh-your-client_secret)

> ## 🚧
> 
> **NB** : The `client_id` cannot be refreshed or changed for existing apps. The only way to get a new `client_id` would be to create a new app.

![](https://files.readme.io/ca3dc60-Pipedrive_Developer_Hub_-_refresh_client_secret_-_OAuth_authorization.png)

  1. [Log in to Developer Hub on your developer sandbox account](https://app.pipedrive.com/auth/login)
  2. Click on the app name that you want to refresh the `client_secret` for and go to the “OAuth & access scopes” tab
  3. Scroll down to the Client ID section and click “Refresh” below your Client secret
  4. A dialog box will appear to confirm if you want to deactivate your current client secret and generate a new one
  5. Click “Generate new client secret” to obtain your new `client_secret`



Resetting your `client_secret` will not invalidate any user tokens. However, you will need to update any application configuration using the old `client_secret` because it will no longer work.

__Updated 7 months ago

* * *

Read next

  * [OAuth authorization](/docs/marketplace-oauth-authorization)
  * [Developer Hub](/docs/developer-hub)
  * [Creating an app](/docs/marketplace-creating-a-proper-app)
  * [Registering a public app](/docs/marketplace-registering-the-app)
  * [App installation flows](/docs/app-installation-flows)


