# Pipedrive API in Postman or Insomnia

[ __Suggest Edits](/edit/run-pipedrive-api-in-postman-or-insomnia)

In this guide, we'll give you a basic overview of how to make your first requests to the Pipedrive API using two API testing tools - [Postman](/docs/run-pipedrive-api-in-postman-or-insomnia#pipedrive-postman) and [Insomnia](/docs/run-pipedrive-api-in-postman-or-insomnia#section-pipedrive-insomnia).

If you prefer to use a different tool, you can always import our OpenAPI 3 specification files (available for both [**v1**](https://developers.pipedrive.com/docs/api/v1/openapi.yaml) and [**v2**](https://developers.pipedrive.com/docs/api/v1/openapi-v2.yaml) APIs) into your tool of choice.

> ## 📘
> 
> Keep in mind that we'll occasionally update our Open API 3 specification file, so you might need to re-import it from time to time.

  


* * *

## 

Pipedrive + Postman

[](#pipedrive--postman)

* * *

### 

Setup

[](#setup)

If you don't have Postman yet, start by downloading and installing it from <https://www.getpostman.com/downloads/>.

Once you have Postman installed, you can start adding the Pipedrive API collection by clicking this button: 

[![Run in Postman](https://run.pstmn.io/button.svg)](https://god.gw.postman.com/run-collection/14918448-e95333b6-f43d-43b7-8d53-c64ee5562381?action=collection%2Ffork&collection-url=entityId%3D14918448-e95333b6-f43d-43b7-8d53-c64ee5562381%26entityType%3Dcollection%26workspaceId%3D86dfbf1b-5b49-49e8-b6e7-7010921f2741)

### 

Authorization

[](#authorization)

The easiest way to authorize your requests is by using your API token. To do that you will first need to find it under your Personal preferences settings page in Pipedrive (see how to do that [here](/docs/how-to-find-the-api-token)).

Next, continue with the following steps:

  * To authorize your requests, add your API token to Postman by clicking on the collection name.
  * Click on the "Auth" tab.
  * Add the type of authorization method, the Key (which is `x-api-token`), the value of your API token and choose "Add to" to be "Header".



Now you can make your first requests. Make sure that under the Authorization tab, the authorization type is selected as "Inherit auth from parent".

![](https://files.readme.io/547780a3afa159337b3ec5f6f1aaee537243cfb3388c46bccd2cae22d74a240c-postman-auth.gif)

* * *

## 

Pipedrive + Insomnia

[](#pipedrive--insomnia)

### 

Setup and Authorization

[](#setup-and-authorization)

If you don't have Insomnia yet, first start by installing it from <https://insomnia.rest/download/>.

Next, continue with adding the Pipedrive API collection: 

  1. Open Insomnia and click on the "Import" 
  2. Choose "Url" and add the URL of the specification file: <https://developers.pipedrive.com/docs/api/v1/openapi.yaml> (v1) or <https://developers.pipedrive.com/docs/api/v1/openapi-v2.yaml> (v2)
  3. Once the API specification has been imported, click on it and select "Generate collection" from the Spec tab
  4. Choose "OpenAPI env" from the Environments dropdown menu.
  5. Click on the Edit icon next to "Collection Environments" and add your API token as the `xApiToken` variable value

![](https://files.readme.io/b275985402c8a52bb085e0c9460a55372fde5659153950fc307db1c47f2c4a3d-insomnia.gif)

Now you can make your first requests! The Auth tab should be pre-filled with the correct environment values:

![](https://files.readme.io/a025261f569220815c0dc54b5c8b0c8c36c5840e707c0ae81c417a8bc4aaa3c7-Screenshot_2025-09-26_at_17.16.28.png)

__Updated 30 days ago

* * *
