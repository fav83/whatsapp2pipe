# Invoicing app extension

[ __Suggest Edits](/edit/app-extensions-invoicing)

> ##  🚧
> 
> This is a BETA feature!
> 
> For more info, help, and feedback, please get in touch with us at [[email protected]](/cdn-cgi/l/email-protection#c7aaa6b5aca2b3b7aba6a4a2e9a3a2b1b487b7aeb7a2a3b5aeb1a2e9a4a8aa).

**Read this if:** You want to develop or are developing integration with invoicing capability.

* * *

## 

What is Invoicing app extension?

[](#what-is-invoicing-app-extension)

Apps that provide an invoicing capability can now display their contents right inside Pipedrive, allowing them to:

  1. Create invoices from within the deal detail view and also see, send by email, download and approve invoices directly from the flow item. Once the app is installed, users can view and add necessary information about an invoice both directly from and to the installed invoicing app.

![2772](https://files.readme.io/f78e3af-invoicing_app_extension.png)

Invoice menu’s location inside deal detail view in Pipedrive’s web app

  2. Make use of Pipedrive’s products feature to create invoices automatically from the deal’s products

![2526](https://files.readme.io/b68d85c-invoicing_app_extension_modal.png)

Using a deal’s products to select what to invoice

  3. Link a person or organization to an app extension contact

![2526](https://files.readme.io/5b7f456-invoicing_app_extension_modal2.png)

Clicking on the icon on the right of the contact allows users to link/unlink a person or an organization with a provider contact, making it possible to invoice customers directly from within Pipedrive

  4. Show contextual information about a person or organization value through an invoicing panel

![1414](https://files.readme.io/90715c2-invoicing_app_extension_panel.png)

Invoicing panel in the deal detail view shows customer financial statement for this quarter from an invoicing app

  


* * *

## 

Development process

[](#development-process)

* * *

To extend your app’s capabilities to the invoice tab and invoice panel in Pipedrive, we’ve built a logic of reverse APIs, where Pipedrive will request information from the invoicing service’s API. These requests will be made to endpoints that are defined in a [manifest](/docs/app-extensions-invoicing#manifest-for-invoicing-app-extension) uploaded to the [Developer Hub](/docs/marketplace-registering-the-app#app-extensions) by the app creator.

### 

Steps to take

[](#steps-to-take)

To begin, you’ll need access to the [Developer Hub](https://app.pipedrive.com/developer-hub), where your app is maintained.

Next, the app must utilize [OAuth 2.0](/docs/marketplace-oauth-api) and enable the invoice integration scope.

  * For more info on how to connect an app to Pipedrive or to third party services when the app acts as an intermediary, see [connecting the app](/docs/app-extensions-invoicing#connecting-the-app)



Once the tokens necessary for OAuth 2.0 are stored, you should get acquainted with how to add the manifest.

  


* * *

## 

Manifest for invoicing app extension

[](#manifest-for-invoicing-app-extension)

* * *

The manifest describes, in a special contract format, the endpoints which Pipedrive API makes requests to. Based on the responses of those requests, the invoicing information will display inside Pipedrive. The data will be displayed in a pre-defined format which you can see at [the top of this page](/docs/app-extensions-invoicing#what-is-invoicing-app-extension).

The manifest for your app will need the appropriate URLs of invoicing service’s endpoints. Once the manifest for your invoicing app is submitted to Developer Hub, it will be validated against a pre-defined schema.

### 

Template for invoicing manifest

[](#template-for-invoicing-manifest)

The file below defines the JSON schema for an app that wants to display its contents inside the Pipedrive invoice tab through the manifest.

This is a sample of the manifest you’d need to submit for the Invoicing app extension. For your own manifest, just add your values for `clientID`, `endpoints`, and `templates` (if they’re being used). For a detailed explanation, see [the explanations table](/docs/app-extensions-invoicing#explanation-of-the-manifest).

JSON
    
    
    {
      "version": "v202101",
      "clientId": "dummyclientid123",
      "features": {
        "templates": true
      },
      "endpoints": {
        "getAccounts": "https://www.example.com/:linkId/invoice-accounts",
        "getContact": "https://www.example.com/:linkId/contacts/:contactId",
        "getCurrencies": "https://www.example.com/:linkId/currencies",
        "getInvoicePDF": "https://www.example.com/:linkId/invoices/:invoiceId/download",
        "getInvoiceShareUrl": "https://www.example.com/:linkId/invoices/:invoiceId/share",
        "getInvoiceSummary": "https://www.example.com/:linkId/report/invoice-summary",
        "getProduct": "https://www.example.com/:linkId/products/:productId",
        "getProviderAccount": "https://www.example.com/:linkId",
        "getProviderAccountConnectUrl": "https://www.example.com/users/:linkId/auth",
        "getSearchContacts": "https://www.example.com/:linkId/contacts",
        "getSearchInvoices": "https://www.example.com/:linkId/invoices",
        "getSearchProducts": "https://www.example.com/:linkId/products",
        "getTaxRates": "https://www.example.com/:linkId/tax-rates",
        "getTemplates": "https://www.example.com/:linkId/invoice-templates",
        "postContact": "https://www.example.com/:linkId/contacts",
        "postInvoice": "https://www.example.com/:linkId/invoices",
        "postInvoiceEmail": "https://www.example.com/:linkId/invoices/:invoiceId/email",
        "postInvoiceStatus": "https://www.example.com/:linkId/invoices/:invoiceId/action",
        "postProduct": "https://www.example.com/:linkId/products",
        "putContact": "https://www.example.com/:linkId/contacts/:contactId",
        "putProduct": "https://www.example.com/:linkId/products/:productId"
      }
    }
    

### 

Manifest URL format

[](#manifest-url-format)

All endpoints’ values in the manifest must be provided as strings. We support the following parameters in the URL strings, which will be replaced. 

  * `linkId` will be replaced with the unique identifier the vendor [registers the connection with](/docs/app-extensions-invoicing#finalizing-the-connection) with that represents the connection between the app and the user. `linkId` must be in all endpoints' URLs.

  * `invoiceId` will be replaced by the unique identifier of the Invoice that is returned in `getInvoice` endpoint. `invoiceId` must be provided in the URLs of [`postInvoiceStatus`](/docs/app-extensions-invoicing#post-invoice-status) , [`postInvoiceEmail`](/docs/app-extensions-invoicing#post-invoice-email), [`getInvoiceShareUrl`](/docs/app-extensions-invoicing#get-invoice-share-url), and [`getInvoicePDF`](/docs/app-extensions-invoicing#get-invoice-pdf).

  * `contactId` will be replaced with the unique identifier of a contact that is returned via contact methods like [`postContact`](/docs/app-extensions-invoicing#post-contact) and [`getSearchContacts`](/docs/app-extensions-invoicing#get-search-contacts).

  * `productId` will be replaced with the unique identifier of a product that is returned via product methods like [`postProduct`](/docs/app-extensions-invoicing#post-products) and [`getSearchProducts`](/docs/app-extensions-invoicing#get-search-products).




A valid URL would be `"https://www.example.com/:linkId/invoicePDF/:invoiceId"` where `linkId` is the unique identifier of the connection and `invoiceId` unique identifier of the invoice.

### 

Explanation of the manifest

[](#explanation-of-the-manifest)

The invoicing app extension’s manifest describes the following object (see table).  
For the endpoints, you’ll need to give valid URLs of your invoice service’s endpoints to which Pipedrive will request.

Object| Explanation| Required or optional  
---|---|---  
`"version"`| Defines the version of the manifest. Currently, the only supported version is `"v202101"`.| required  
`"clientId"`| Your app's client ID. You can get it from the [OAuth & access scopes](marketplace-registering-the-app#oauth--access-scopes) tab in [Developer Hub](https://app.pipedrive.com/developer-hub).| required  
`"features"`| Here you can define the features that your app can also provide.  
  
In here, your app can define invoice templates and then pass the following object to the `"features"` array:  
  
`"templates": true`  
  
Please note that when `"templates": true`, `getTemplates` endpoint must also be provided.  
Send empty if you don't support templates.| required  
`"endpoints"`| Defines a set of invoice service endpoints' URLs which Pipedrive will make requests to|   
`"getAccounts"`| [See `getAccounts`](/docs/app-extensions-invoicing#getaccounts)| required  
`"getContact"`| [See `getContact`](/docs/app-extensions-invoicing#getcontact)| required  
`"getCurrencies"`| [See `getCurrencies`](/docs/app-extensions-invoicing#getcurrencies)| required  
`"getInvoicePDF"`| [See `getInvoicePDF`](/docs/app-extensions-invoicing#getinvoicepdf)| required  
`"getInvoiceShareUrl"`| [See `getInvoiceShareUrl`](/docs/app-extensions-invoicing#getinvoiceshareurl)| required  
`"getInvoiceSummary"`| [See `getInvoiceSummary`](/docs/app-extensions-invoicing#getinvoicesummary)| required  
`"getProduct"`| [See `getProduct`](/docs/app-extensions-invoicing#getproduct)| required  
`"getProviderAccount"`| [See `getProviderAccount`](/docs/app-extensions-invoicing#getprovideraccount)| required  
`"getProviderAccountConnectUrl"`| [See `getProviderAccountConnectUrl`](/docs/app-extensions-invoicing#getprovideraccountconnecturl)| required  
`"getSearchContacts"`| [See `getSearchContacts`](/docs/app-extensions-invoicing#getsearchcontacts)| required  
`"getSearchInvoices"`| [See `getSearchContacts`](/docs/app-extensions-invoicing#getsearchinvoices)| required  
`"getSearchProducts"`| [See `getSearchContacts`](/docs/app-extensions-invoicing#getsearchproducts)| required  
`"getTaxRates"`| [See `getTaxRates`](/docs/app-extensions-invoicing#gettaxrates).| required  
`"getTemplates"`| [See `getTemplates`](/docs/app-extensions-invoicing#gettemplates).| required  
`"postContact"`| [See `postContact`](/docs/app-extensions-invoicing#postcontact)| required  
`"postInvoice"`| [See `postInvoice`](/docs/app-extensions-invoicing#postinvoice)| required  
`"postInvoiceEmail"`| [See `postInvoiceEmail`](/docs/app-extensions-invoicing#postinvoiceemail)| optional  
`"postInvoiceStatus"`| [See `postInvoiceStatus`](/docs/app-extensions-invoicing#postinvoicestatus)| required  
`"postProduct"`| [See `postProduct`](/docs/app-extensions-invoicing#postproduct)| required  
`"putContact"`| [See `putContact`](/docs/app-extensions-invoicing#putcontact)| required  
`"putProduct"`| [See `putProduct`](/docs/app-extensions-invoicing#putproduct)| required  
  
  


* * *

## 

Connecting the app

[](#connecting-the-app)

* * *

### 

Connecting the app to Pipedrive

[](#connecting-the-app-to-pipedrive)

The application is installed by clicking install in the Pipedrive Marketplace. Once the user has agreed to the [scopes](/docs/marketplace-scopes-and-permissions-explanations), the browser gets redirected to the app’s registered `callback URL` ([step 3 of OAuth authorization](/docs/marketplace-oauth-authorization#step-3-callback-to-your-app)).

At this moment, the app needs to fetch and permanently store the OAuth tokens it receives from Pipedrive ([step 4 of the OAuth authorization](/docs/marketplace-oauth-authorization#step-4-and-step-5-getting-the-tokens)). For invoicing apps, we require generating a unique identifier string (for example, a `UUID`) for each connection/link, which will be used by Pipedrive for all API calls executed against the app (also see [finalizing the connection](/docs/app-extensions-invoicing#finalizing-the-connection)).

### 

Connecting the app to an invoicing provider

[](#connecting-the-app-to-an-invoicing-provider)

If the app is an intermediate between a service provider, it needs to authenticate against the provider according to that service specification. You’ll likely need to authenticate against their OAuth and store the required tokens **along with** Pipedrive tokens.

### 

Finalizing the connection

[](#finalizing-the-connection)

After the unique identifier has been generated and the OAuth tokens stored, the app needs to register itself as a data provider by calling the Pipedrive API `https://{COMPANYDOMAIN}.pipedrive.com/api/v1/invoice/user/provider` with `RegisterProviderLink` payload and using `Authorization: Bearer <access_token> ` header. 

To finalize everything, the app should redirect the user to the `redirectUrl` that was received as the response for the registration call against Pipedrive API. On that page, the user will see if both the installation and connecting process succeeded and can then configure their preferences.

Sample of expected `RegisterProviderLink` payload structure:

JSON
    
    
    {
       "data":{
          "linkId":"string", 
          "orgId":"string", 
          "marketplaceClientId":"string"
       }
    }
    

Explanation of attributes:

Name| Type| Description  
---|---|---  
`linkId`| string  
required| The unique identifier of the user in the Invoice app  
`orgId`| string  
required| ID of the user company in the Invoice service, not the app  
`marketplaceClientId`| string  
required| `clientId` of the app in Pipedrive Marketplace  
  
  


* * *

## 

Invoicing API reference

[](#invoicing-api-reference)

* * *

### 

Authentication

[](#authentication)

All requests from Pipedrive to the app will be supplemented with an authentication header that uses the same `client_id` and `client_secret` as the OAuth token exchange in [OAuth authorization](/docs/marketplace-oauth-authorization).  
E.g. `Authorization: Basic <base64(client_id:client_secret)> `

* * *

### 

API payloads

[](#api-payloads)

All API responses from the endpoints defined in the manifest are expected to be JSON, where data depends on the endpoint.

JSON
    
    
    { 
      "success": boolean,
      "data": "depends on the endpoint"
    }
    

  


* * *

## 

Invoicing API endpoints

[](#invoicing-api-endpoints)

* * *

### 

getProviderAccount

[](#getprovideraccount)

**required**

Gives the app's status, whether or not it is correctly **installed** and connected for the user. This endpoint returns a JSON payload with the provider account setup status.  
Must return `LinkStatus` as data in the payload.

Sample of expected response structure:

JSON
    
    
    {
       "success": boolean,
       "data":{
          "authorized": true, 
          "name":"string",
          "orgId":"string",
          "features":"LinkFeatures"
       }
    }
    

Explanation of attributes:

Name| Type| Description  
---|---|---  
`authorized`| boolean  
required| Displays the status of the app. Returns `true` or `false` based on the success of the authorization. If the authorization was a success, additional attributes will be sent in the response body.  
`name`| string  
optional| The name of the user’s company or organization in the invoice service  
`orgId`| string  
optional| The ID of the user’s company or organization in the invoice service  
`features`| object  
optional| `LinkFeatures`  
  
**The structure of`LinkFeatures`:**

JSON
    
    
    {
      invoiceTaxModeOptions: InvoiceTaxModeOptions;
      invoiceTaxOption: InvoiceTaxOption;
      invoiceDiscountOptions: InvoiceDiscountOptions;
      invoiceNumberOption: InvoiceNumberOption; 
      validations: Validations;
    }
    

**Explanation of the attributes:**

`documentTaxRateInput` and `lineItemTaxRateInput` set how the tax rate will be displayed for the invoice. 

Name| Type| Description/Values  
---|---|---  
`invoiceTaxModeOptions`  
  
`{ taxExclusive: boolean; taxInclusive: boolean; noTax: boolean; }`| object - required| `taxExclusive` \- When `true`, invoicing will support tax exclusive invoices mode. Tax will be added to the invoice values.  
  
`taxInclusive` \- When `true`, invoicing will support tax inclusive invoices mode. Tax will be calculated as already included in the invoice values.  
  
`noTax` \- when `true`, invoicing will support no tax invoices  
  
These modes are not exclusive and will be used by Invoicing modal to give the invoice behavior options, but you need to have at least one set to `true`.  
`invoiceTaxOption `| enum - required| `single` \- Invoice will show in a single tax mode  
  
You can only pick a single tax per invoice that will be applied to all line items checked.  
User will see the check boxes and that tax will be given to those lines.  
  
`multiple` \- Different tax rates can be applied to line items  
`invoiceDiscountOptions`  
  
`{ globalDiscount: boolean; lineDiscount: boolean; }`| object - required| `globalDiscount` \- When `true` user can give the invoice global discounts (amount or percentage)  
  
`lineDiscount` \- When `true` user can set discounts (percentage only) to line items  
`invoiceNumberOption`| enum - required| `none` \- Optional assignment of invoice number during its creation  
  
`mandatory` \- An invoice number must be provided to create the invoice  
`Validations`  
  
`{ product: { name: { maxLength: number; }; code: { maxLength: number; }; description: { maxLength: number; }; }; };`| object - required| Defines the maximum length acceptable for product `name`, `code` and `description` respectively  
  
For example, see the image below, where the tax rate can be applied on the line item level with each line item having a separate tax rate. 

![1164](https://files.readme.io/5d7b88a-invoicing_4.png)

**Structure of`LinkFeatures` for the format in the above image:**

JSON
    
    
    {
      "invoiceTaxModeOptions": {
        taxExclusive: true,
        taxInclusive: true,
        noTax: true,
      },
      "invoiceTaxOption": "multiple",
      "invoiceDiscountOptions": {
        globalDiscount: false,
        lineDiscount: true,
      },
      "invoiceNumberOption": "none",
    }
    

  


* * *

### 

getProviderAccountConnectUrl

[](#getprovideraccountconnecturl)

**required**

Returns a JSON payload with a URL where the user will be redirected to when the provider account connection has expired or failed for any reason. 

Must return `LinkAuthURL` as data in the payload.

**Sample of expected response structure for`LinkAuthURL`:**

JSON
    
    
    {
       "success": boolean,
       "data":{
          "url":"URL" 
       }
    }
    

*_Explanation of attributes:_

Name| Type| Description  
---|---|---  
`url`| string - required| The URL of the connection  
  
  


* * *

## 

Invoice related endpoints

[](#invoice-related-endpoints)

* * *

### 

postInvoice

[](#postinvoice)

**required**

Creates an invoice in the provided invoice service from the payload object `InvoiceCreateData`. Must return `Invoice` as data.

**Sample of`InvoiceCreateData` structure:**

JSON
    
    
    {
       "success": boolean,
       "data":{
         "contactId": string | null,
          "contactName": string,
          "address": string,
          "email": string,
          
          "taxNumber": string,
          "taxModeId": TaxMode,
          
          "globalDiscount": {
    	discountAmount: number;
    	discountPercentage: number | null;
          } | null;
    
          "taxRateId": string | null,
          "templateId": string | null;
          "currencyId": string | null;
    	
          "invoiceNumber": string | null,
          
          "issueDate": string,
          "dueDate": string | null,
    
          "lineItems": CreateInvoiceLineItem[]
       }
    }
    

Explanations of attributes:

Name| Type| Explanation/Value  
---|---|---  
`contactId`| string  
optional| The unique ID of a contact in the invoicing service. `contactID` is used to link the invoice to a specific contact.  
`contactName`| string  
required| The name of the contact Person or Organization of the invoice. This is usually a multi line string.  
`address`| string  
required| The address of the contact Person or Organization of the invoice.  
It can be left empty.  
`email`| string  
required| The email of the contact Person of the invoice.  
It can be left empty.  
`taxNumber`| string  
required| The customer VAT ID number.  
Can be empty.  
`taxModeId`| string  
required| The type of tax set on products/items.  
Possible values:  
  
`'Inclusive'`  
`'Exclusive'`  
`'NoTax'`  
`globalDiscount`  
  
`{ discountAmount: number; discountPercentage: number | null; } | null;`| object  
optional| Global discounts are applied to invoice’s subtotal, even if a line item had a discount percentage.  
  
The object of the `globalDiscount` will be added when a global discount is applied to the invoice.  
  
`discountAmount` is always mandatory.  
  
`discountPercentage` is only present when discount was applied in percentages.  
`taxRateId`| string  
optional| The ID of the tax rate that is [available in `InvoiceTaxRate[]`](/docs/app-extensions-invoicing#get-tax-rates).  
Can be `null`.  
`invoiceNumber`| string  
optional| Can be `null  
`issueDate`| string  
required| The invoice creation date in ISO8601 format  
`dueDate`| string  
optional| The date on the invoice indicating when payment is due, in ISO8601 format.  
Can be `null`.  
`currencyId`| string  
optional| ID of the currency type that is used.  
Can be `null`.  
`templateId`| string  
optional| The ID of the template that is used for the invoice.  
Can be `null`.  
`lineItems`| array  
required| `CreateInvoiceLineItem[]`  
  
**Sample of`CreateInvoiceLineItem` structure:**

JSON
    
    
    {
        "productId": string | null,
        "productCode": string | null,
        "description": string,
        "quantity": number | null, 
        "unitPrice": number | null,
        "discountRate": number | null,
        "taxRateId": string | null,
        "accountId": string,
    }
    

Explanations of attributes:

Name| Type| Description/Value  
---|---|---  
`productId`| string  
optional| Unique product identifier when line item refers to a product  
`productCode`| string  
optional| Unique product code when line item refers to a product  
`description`| string  
required| The description of the item  
`quantity`| number  
optional| Can be `null`.  
The quantity of the item  
`unitPrice`| number  
optional| Can be `null`.  
The price per item's unit.  
`discountRate`| number  
optional| Can be `null`.  
Discount percentage.  
`taxRateId`| string| The ID of the tax rate that is available in `InvoiceTaxRate[]`.  
  
Can be `null`.  
Mandatory when `invoiceTaxOption` has `multiple` as value.  
`accountId`| string| The ID of the account ID that is available in `InvoiceAccount[]`.  
  
`InvoiceAccount { id: string; name: string; }`  
  
Accounting account id, to relate item sales to business accounts.  
  
**Sample of expected response structure for`postInvoice` endpoint:**

JSON
    
    
    {
    	id: string,
    	invoiceNumber: string,
    	contactName: string,
    	statusCode: string,
    	statusLabel: string,
    	pipedriveStatusCode: PipedriveStatusCode,
    	total: number,
    	paidAmount?: number,
    	dueAmount?: number,
    	currencyCode: string,
    	dueDate?: string,
    	paidDate?: string,
    	actions: InvoiceAction[],
    	providerInvoiceUrl: string,
    	isShareable: boolean,
    	isSent: boolean,
    }
    

Explanations of attributes:

Name| Type| Description/Values  
---|---|---  
`id`| string  
required| Unique identifier of the invoice  
`invoiceNumber`| string  
required| The serial number of the invoice  
`contactName`| string  
required| Name of the contact person for the invoice  
`statusCode`| string  
required| The code of the status for the invoice  
`statusLabel`| string  
required| The label of the status of the invoice  
`pipedriveStatusCode`| string  
required| The status of the invoice set by Pipedrive.  
Possible values:  
  
`'draft'`  
`'created'`  
`'issued'`  
`'paid'`  
`'voided'`  
`'deleted'`  
`'partiallyPaid'`  
`total`| number  
required| Total numeric sum of payment  
`paidAmount`| number  
optional| Showcases the amount that has been paid from the invoice.  
  
When invoice amount is partially paid, this number should contain from the invoice total how much was already paid. Of course `paidAmount` <= `total`.  
`dueAmount`| number  
optional| When partially paid this amount should be equal to `total` \- `paidAmount`  
`currencyCode`| string  
required| Reference code indicating the type of currency payment sum is displayed in  
`dueDate`| string  
optional| The date on the invoice indicating when payment is due  
`paidDate`| string  
optional| The date when payment for a service was done  
`actions`| array  
required| `InvoiceAction[]`  
`providerInvoiceUrl`| string  
required| Invoice's URL inside the invoice service. This will allow users to open an invoice using this link  
`isShareable`| boolean  
required| Shows if the invoice can be shared  
`isSent`| boolean  
required| Indicates if the invoice was already sent to customer  
  
Sample of expected response structure for `actions`, these actions usually change depending on the state of the invoice, so when you void an invoice it’s not expected the invoice actions for the current state to contain actions like approving anymore:

JSON
    
    
    [
      // invoice state changes
      {
        "id": "VOIDED",
        "label": "Void invoice",
        "providerAction": "changeInvoiceStatus",
        "requireConfirmation": "regular",
      },
      {
        "id": "DELETED",
        "label": "Delete invoice",
        "providerAction": "changeInvoiceStatus",
        "requireConfirmation": "destructive",
      },
      {
        "id": "APPROVE",
        "label": "Approve invoice",
        "providerAction": "changeInvoiceStatus",
      },
      // download invoice
      {
        "id": "DOWNLOAD",
        "label": "Download invoice",
        "providerAction": "downloadInvoice",
      },
      // Send invoice email
      {
        "id": "EMAIL",
        "label": "Send email invoice",
        "providerAction": "postInvoiceEmail",
      },
       // Send invoice url
      {
        "id": "URL",
        "label": "Get invoice URL to share",
        "providerAction": "getInvoiceShareURL",
      },
    ]
    

  


* * *

### 

postInvoiceStatus

[](#postinvoicestatus)

**required**

Updates the status of the invoice after an action has been done. We will send `InvoiceAction` and the endpoint must respond with `Invoice` as data.  
See a sample of the expected `Invoice` structure [here](/docs/app-extensions-invoicing#postinvoice).  
The URL, described in the manifest for this endpoint, must include `invoiceId`. `invoiceId` represents the unique identifier of an invoice, see the example URL [here](/docs/app-extensions-invoicing#manifest-url-format).

**Sample of`InvoiceAction` structure:**

JSON
    
    
    {
      "id":"VOIDED", // the new state intended
    }
    

Explanations of attributes:

Name| Type| Description/values  
---|---|---  
`id`| string  
required| ID of the action intended to be executed. Like VOIDED, these IDs are provided with the invoice, listing all possible actions for that invoice.  
`label`| string  
required| Label of the action. A text to show to the user.  
`providerAction`| enum  
required| A provider action is a more complex action that is related to the IDs:  
  
`changeInvoiceStatus` -action will trigger a change in the invoice state.  
`sendInvoiceEmail` \- action will send an invoice by email  
`downloadInvoice` \- action will download the invoice  
`openInvoiceLink` \- action will open the invoice link  
`requireConfirmation`| string  
optional| `'regular'` \- regular confirmation, `'destructive'` \- destructive confirmation, similar to a delete  
`null` \- no confirmation required  
  
  


* * *

### 

postInvoiceEmail

[](#postinvoiceemail)

**optional**

`postInvoiceEmail` allows sending the invoice to the customer via email if the invoice was created with the customer’s email. If an email isn’t tied to the invoice, the email will fail.

Upon request, we will send `InvoiceAction,` and the endpoint on the provider side must respond with `Invoice` as data.  
The URL described in the manifest for this endpoint must include `invoiceId`.  
If this operation is not included, the corresponding action of `actions` is not required.  
See a sample of the response structure of `Invoice`[here](/docs/app-extensions-invoicing#postinvoice).

  


* * *

### 

getSearchInvoices

[](#getsearchinvoices)

**required**

Returns invoice objects for all invoices from the provider by search criteria.  
This method implements 2 search criteria:

  * by the list of invoice IDs (`ids`), which are passed as query parameters and are a comma-separated list;
  * by `customerId` where additional criteria are provided:
  * `customerId` \- ID of the customer whose invoices we are searching from
  * `startDate` \- start date of the invoice search (inclusive), usually the issue date
  * `endDate` (optional)- end date of the invoice search (inclusive), usually the issue date
  * `page` \- the page of the invoice records. The first page is 1. The number of records returned per page will depend on your implementation.



Must return `Invoice` as data. See a sample of the expected response structure [here](/docs/app-extensions-invoicing#postinvoice).

  


* * *

### 

getInvoiceShareUrl

[](#getinvoiceshareurl)

**required**

Get a shareable link of the invoice that can be sent to the customers. The URL described in the manifest for this endpoint must include `invoiceId`. `invoiceId` represents the unique identifier of an invoice; see the example URL [here](/docs/app-extensions-invoicing#manifest-url-format).  
Must return `LinkAuthURL` as data.  
See a sample of the expected `LinkAuthURL` structure [here](/docs/app-extensions-invoicing#getprovideraccountconnecturl).

  


* * *

### 

getInvoicePDF

[](#getinvoicepdf)

**required**  
Download the invoice as a file. Must respond with a file download stream. The URL described in the manifest for this endpoint must include `invoiceId`. `invoiceId` represents the unique identifier of an invoice; see the example URL [here](/docs/app-extensions-invoicing#manifest-url-format).

  


* * *

### 

getInvoiceSummary

[](#getinvoicesummary)

**required**

Obtains a summary of the customer’s invoices.  
The URL described in the manifest for this endpoint must have the following query parameters:

Name| Type| Descriptions/Values  
---|---|---  
`contactId`| string  
required| The ID of the customer  
`to`| string  
optional| The start date inclusive,  
ISO8601 formatted  
`from`| string  
optional| The end date inclusive, ISO8601 formatted  
`refresh`| boolean  
optional| Forces cache to be updated when it exists.  
  
Sample of expected response structure:

JSON
    
    
    { 
    "success": boolean;
      "data": [ 
        {    
          "currency": string,   // 3 letter currency code ISO4217
          "outstanding": number,// Amount that has not been paid for and is not overdue
          "overdue: number,     // Amount that has not been paid for and is overdue
          "paid": number,       // Amount that has been paid
          "total": number,      // Total amount
        },
        ...
      ]
    }
    

  


* * *

## 

Data related methods

[](#data-related-methods)

* * *

### 

getCurrencies

[](#getcurrencies)

**required**

Get all currencies that the invoicing service supports. Must return `InvoiceCurrency[]` as data.

Sample of expected response structure:

JSON
    
    
    { 
    "success": boolean;
      "data": [ 
        {    
          "id": string,   // required, unique ID for currency
          "name": string  // required, currency name
        },
        ...
      ]
    }
    

  


* * *

### 

getTaxRates

[](#gettaxrates)

**required**  
Get all tax rates that can be applied to the invoice. Depending on the `LinkFeatures`, the tax rate will apply either for the whole invoice or to an invoice line item.  
Must return `InvoiceTaxRate[]` as data.

Sample of expected response structure:

JSON
    
    
    {
       "success":"boolean",
       "data":[
          {
             "id": string,  // required, unique tax rate id
             "name": string,  // required, tax rate name
             "rate": number,  // required, tax rate value
          },
          ...
       ]
    }
    

  


* * *

### 

getAccounts

[](#getaccounts)

**required**

Get all accounting accounts' tax rates that can be applied to the invoice. The account will apply either for the invoice line item and for item creation.  
Must return `InvoiceAccount[]` as data.

Sample of expected response structure:

JSON
    
    
    {
       "success":"boolean",
       "data":[
          {
             "id": string,  // required, unique account id
             "name": string,  // required, account name
          },
          ...
       ]
    }
    

  


* * *

### 

getTemplates

[](#gettemplates)

**required**

Get all templates that the invoice can use. Templates are used by some providers to change the invoice’s visual appearance, payment details, etc. It can be disabled via the manifest and in that case, this endpoint is not required.  
Must return `InvoiceTemplate[]` as data.

Sample of expected response structure: 

JSON
    
    
    {
       "success": boolean,
       "data":[
          {
             "id": string, // required, unique template ID
             "name": string, // template name,
          },
          ...
       ]
    }
    

  


* * *

## 

Item (product) related methods

[](#item-product-related-methods)

* * *

### 

getProduct

[](#getproduct)

**required**

The endpoint provides a product based on its ID. The URL for this endpoint must include the `productId` parameter.  
The response must return `Product` as data.

Sample of expected response structure:

JSON
    
    
    {
      "success": boolean,
      "data": {
          "id": string,         // unique product ID
          "name": string,       // mandatory
          "description": string,// optional
          "code": string,       // optional
          "accountId": string,  // optional, finantial account to used for product
          "taxRateId": string,  // optional, default product tax rate
          "unitPrice": number,  // optional
          "currency": string,   // optional currency code
      }
    }
    

  


* * *

### 

postProduct

[](#postproduct)

**required**

Creates a product on the provider’s side. It receives all data of a `Product`, except for the ID assigned on Pipedrive’s side. 

Must return `Product` as data with the ID of the new product.

Sample of expected response structure:

JSON
    
    
    {
      "success": boolean,
      "data":[
        {
          "id": string,         // unique product ID
          "name": string,       // mandatory
          "description": string,// optional
          "code": string,       // optional
          "accountId": string,  // optional, finantial account to used for product
          "taxRateId": string,  // optional, default product tax rate
          "unitPrice": number,  // optional
          "currency": string,   // optional currency code
        },
        ...
      ]
    }
    

  


* * *

### 

putProduct

[](#putproduct)

**required**

Updates a product based on its ID that can be used in an invoice. The URL, described in the manifest for this endpoint, must include `productId`.  
Must return newly updated `Product` as data.

  


* * *

### 

getSearchProducts

[](#getsearchproducts)

**required**

Returns `InvoiceItem[]` for all items from the provider’s side that matches search criteria. The following criteria can be added to the search query:

Name| Type| Description/values  
---|---|---  
`name`| string  
required| Product name to search, should be case insensitive  
`code`| string  
optional| Represents product code when primary key  
`forceCodeSearch`| boolean  
required| When `true` and implementation has unique product codes, the search must be preformed by product codes. This is done as some invoice services use `name` as primary key and some use `code`. We differentiate `code` from `productID`.  
  
  


* * *

## 

Contact related methods

[](#contact-related-methods)

* * *

### 

getContact

[](#getcontact)

**required**

Gets a contact based on its ID that can be used in an invoice. The URL, described in the manifest for this endpoint, must include `contactId`.  
Must return `Contact` as data.

Sample of expected response structure:

JSON
    
    
    {
      "success": boolean,
      "data":[
        {
          "id": string, // unique contact ID
          "displayName": string,
          "address": string,    // optional, multiline string
          "postalCode": string, // optional
          "city": string,       // optional
          "country": string,    // optional
          "email": string,      // optional
          "phone": string,      // optional
          "taxId": string,      // optional, VAT id number
          "url": string,        // optional, url to open contact in provider
        },
        ...
      ]
    }
    

Explanations of attributes:

Name| Type| Description  
---|---|---  
`id`| string  
required| The ID of the contact  
`displayName`| string  
required| Name of the contact  
`address`| string  
optional| Multi-line address string  
`postalCode`| string  
optional| Contact postal address  
`city`| string  
optional| Contact city  
`country`| string  
optional| Contact country  
`email`| string  
optional| Contact email  
`phone`| string  
optional| Contact phone  
`taxId`| string  
optional| Contact VAT ID number  
`url`| string  
optional| Contact URL for editing  
  
  


* * *

### 

postContact

[](#postcontact)

**required**

Creates a contact on the provider’s side, receives all data from `Contact`, except for the ID. 

Must return `Contact` as data with the ID of the new contact.

JSON
    
    
    {
      "success": boolean,
      "data":[
        {
          "id": string, // unique contact ID
          "displayName": string,
          "address": string,    // optional, multiline string
          "postalCode": string, // optional
          "city": string,       // optional
          "country": string,    // optional
          "email": string,      // optional
          "phone": string,      // optional
          "taxId": string,      // optional, VAT id number
          "url": string,        // optional, url to open contact in provider
        },
        ...
      ]
    }
    

  


* * *

### 

putContact

[](#putcontact)

**required**

Updates a contact based on its ID that can be used in an invoice. The URL, described in the manifest for this endpoint, must include ` contactId`.  
Must return newly updated ` Contact` as data.

Sample of expected response structure:

JSON
    
    
    {
      "success": boolean,
      "data":[
        {
          "id": string, // unique contact ID
          "displayName": string,
          "address": string,    // optional, multiline string
          "postalCode": string, // optional
          "city": string,       // optional
          "country": string,    // optional
          "email": string,      // optional
          "phone": string,      // optional
          "taxId": string,      // optional, VAT id number
          "url": string,        // optional, url to open contact in provider
        },
        ...
      ]
    }
    

  


* * *

### 

getSearchContacts

[](#getsearchcontacts)

**required**

Returns `Contact` objects for all contacts from the providers by search criteria. The search criteria are the name of the contact, which needs to be passed as a query parameter `name`.

Sample of expected response structure:

JSON
    
    
    {
      "success": boolean,
      "data":[
        {
          "id": string, // unique contact ID
          "displayName": string,
          "address": string,    // optional, multiline string
          "postalCode": string, // optional
          "city": string,       // optional
          "country": string,    // optional
          "email": string,      // optional
          "phone": string,      // optional
          "taxId": string,      // optional, VAT id number
          "url": string,        // optional, url to open contact in provider
        },
        ...
      ]
    }
    

  


__Updated over 1 year ago

* * *
