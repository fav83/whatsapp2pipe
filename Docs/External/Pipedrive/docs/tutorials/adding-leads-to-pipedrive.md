[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

Relationship between Leads and Deals

  3. 3

Adding a new Lead

  4. 4

API URL and Payload structure

  5. 5

Code Sample (Node.js)




###### Topics

  1. 1

Introduction

  2. 2

Relationship between Leads and Deals

  3. 3

Adding a new Lead

  4. 4

API URL and Payload structure

  5. 5

Code Sample (Node.js)




[← Back to tutorials](/tutorials)

## Adding a Lead via Pipedrive API

## 1\. Introduction

Leads are potential Deals that are stored separately in the Leads Inbox within Pipedrive.

The Leads resource allows you to get, create, update, and delete Leads, Lead Labels, and get Lead Sources.

In the API requests, each Lead needs to be named (using the `title` field) and **be linked to either a Person or an Organization**. Linking to either a Person or an Organization is required in order to keep all the information regarding Contacts in one part of Pipedrive, instead of separating it between Contacts and Leads Inbox, as it is crucial information in sales peoples' daily work. In this way, all communication between the salesperson and the contact can be found in one place (Person or Organization detail view in Pipedrive) throughout the entire sales cycle.

## 2\. Relationship between Leads and Deals

Leads can contain the same custom fields as the custom fields of a Deal. If the value of a custom field has been set for a Lead, it will appear in the response of the request.

![](/tutorials/_next/static/media/62ba502f654651d1.b118edae.png)

## 3\. Adding a new Lead

First, you need to think about how you authenticate your request to our API. You can use either an API token (see the code snippet below) or [OAuth](https://pipedrive.readme.io/docs/marketplace-oauth-api). For more information about authenticating your requests, see [authentication](https://pipedrive.readme.io/docs/core-api-concepts-authentication).

As all Leads need to be linked with either a Person or an Organization, you'll need to include the necessary parameters in the request (either `person_id` or `organization_id`). The Person or Organization you want to connect the Lead to needs to be created before the Lead. You can follow this step-by-step guide to learn how to create an Organization.

All `POST` and `PATCH` requests to Leads endpoints must have `content_type: application/json`. For easier use of making requests, find out how to use Pipedrive API with Postman or Insomnia.

You can use the following JSON example to add a new Lead. Don't forget to authenticate your request and add your own values to the JSON structure.

## 4\. API URL and Payload structure

**For authentication with api_token:**

Replace `companydomain` and `apitoken` with your own values:
    
    
    https://{COMPANYDOMAIN}.pipedrive.com/v1/leads?api_token=APITOKEN

**For authentication with OAuth 2.0**

In the case of OAuth, access_token is used without having to pass the API token via the query params:
    
    
    https://{COMPANYDOMAIN}.pipedrive.com/api/v1/leads

Here's a simple payload for create a lead with title "Slack lead" associated with person who has ID 33 in that Pipedrive account.
    
    
    {
      "title": "Slack lead",
      "person_id": 33
    }

## 5\. Code Sample (Node.js)

The logic is straightforward once you decide the structure and the data that goes within it. Here's a Node.js snippet to demonstrate the usage.
    
    
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();
    
    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    
    async function addLead() {
        try {
            console.log('Sending request...');
    
            const api = new pipedrive.LeadsApi(defaultClient);
    
            const data = {
                title: 'Lead 158',
                value: {
                    amount: 3000,
                    currency: 'USD'
                },
                owner_id: 13293848,
                label_ids: [
                    'f981d20f-cd00-4e30-a406-06576a92058b'
                ],
                person_id: 1,
                organization_id: 1,
                expected_close_date: '2022-07-12',
                visible_to: '1',
                was_seen: true
            }
            const response = await api.addLead(data);
    
            console.log('Lead was added successfully!', response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Adding a lead failed', errorToLog);
        }
    }
    
    
    addLead();

Next 


---

**Source:** https://developers.pipedrive.com/tutorials/adding-leads-to-pipedrive
