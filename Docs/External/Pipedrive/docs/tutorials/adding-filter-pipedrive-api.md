[](https://app.pipedrive.com/auth/login)

###### Topics

  1. 1

Introduction

  2. 2

How to add a condition

  3. 3

JSON structure for filters

  4. 4

Full code example




###### Topics

  1. 1

Introduction

  2. 2

How to add a condition

  3. 3

JSON structure for filters

  4. 4

Full code example




[← Back to tutorials](/tutorials)

## Adding a Filter via Pipedrive API

## 1\. Introduction

Filters can be created in Pipedrive for Deals, Persons, Organizations, Activities, and Products. To get more acquainted with how the filters work, try creating a filter in the Pipedrive web app, then make first a request to [`GET /filters`](https://developers.pipedrive.com/docs/api/v1/Filters#getFilters) to get the ID of the filter, and then a request to [`GET /filters/{id}`](https://developers.pipedrive.com/docs/api/v1/Filters#getFilter) to see how the chosen filter's conditions are defined.

To add a new filter, use the [`POST /filters`](https://developers.pipedrive.com/docs/api/v1/Filters#addFilter) endpoint and ensure you give values to the following parameters:

**Parameter** | **Explanation/possible values**  
---|---  
`name` | Filter's name displayed in the Pipedrive's UI  
`conditions` | The condition parameter defines the filter's structure. `conditions` should be added in JSON format. See [how to add conditions](https://pipedrive.readme.io/docs/adding-a-filter#how-to-add-a-condition).  
`type` | Specifies the entity where the filter will be applied. One of the following:

  * `deals`
  * `leads`
  * `org`
  * `people`
  * `products`
  * `activity`

  
  
## 2\. How to add a condition

`conditions` must be added as a JSON object. The main `conditions` object always starts out with a `glue` parameter which has the value `and` \- this is considered the first-level conditioning group.

Inside the first-level conditioning group, there are two nested second-level `conditions` objects with which you will need to define again the `glue` parameters. In second-level conditioning groups, the values for `glue` can be `and` and `or` (both used only once).

Each filter can have a maximum of 16 conditions.

When you copy this JSON, be sure to remove all comments. Otherwise, the structure won't pass the JSON validation.

## 3\. JSON structure for filters

This is how `conditions` would look like for a filter for seeing all Organizations whose locality contains "Tallinn" and where Organization's name contains "Pipe".
    
    
    { 
       "glue":"and",
       "conditions":[//first level conditioning group
          { 
             "glue":"and",
             "conditions": [//second level conditioning group
                {
                    "object": "organization",
                    "field_id": "4020",
                    "operator": "LIKE '%$%'",
                    "value": "Tallinn",
                    "extra_value": "locality"
                }
             ]
          },
          { 
             "glue":"or",
             "conditions": [//second level conditioning group
                {
                    "object": "organization",
                    "field_id": "4002",
                    "operator": "LIKE '%$%'",
                    "value": "Pipe",
                    "extra_value": null
                }
             ]
          }
       ]
    }

Inside the second level conditioning groups, you must specify the values for "`object`", "`field_id`","`operator`", "`value`", "`extra_value`".

  * "`object`" is the entity whose fields will be used in the filter (e.g. Organization).
  * "`field_id`" - to find the needed field's ID, make a request to the specific entity's fields endpoint (e.g. OrganizationFields).
  * "`operator`" - to understand which operator to use for a certain field you can make a request to [`GET /filters/helpers`](https://developers.pipedrive.com/docs/api/v1/Filters#getFilterHelpers) endpoint which shows available operators for a certain field. E.g. `name` field's `field_type` is varchar, so these are the possible "`operator`" values for this type of a field:


    
    
    "varchar": {
        "=": "is",
        "!=": "is not",
        "IS NULL": "is empty",
        "IS NOT NULL": "is not empty",
        "LIKE '%$%'": "contains",
        "LIKE '$%'": "starts with",
        "NOT LIKE '$%'": "does not start with",
    }
    
    

  * "`value`" - is the value of specified filter field (e.g. "`Tallinn`").
  * "`extra_value`" - is the key of specific field type's subfield (e.g when creating a filter condition by "`address`" type of a field, the "`extra_value`" could be "`locality`" and the "`value`" would be the value of the desired filter condition e.g. "`Tallinn`"). You can also see the possible "`extra_value`"'s by using the [`GET /filters/helpers`](https://developers.pipedrive.com/docs/api/v1/Filters#getFilterHelpers) endpoint.


    
    
    "address_field_components": {
        "subpremise": "Apartment/suite no",
        "street_number": "House number",
        "route": "Street/road name",
        "sublocality": "District/sublocality",
        "locality": "City/town/village/locality",
        "admin_area_level_1": "State/county",
        "admin_area_level_2": "Region",
        "country": "Country",
        "postal_code": "ZIP/Postal code",
        "formatted_address": "Full/combined address"
    }

## 4\. Full code example

You can use this JSON example to add a new filter. For this request the `content_type` needs to be `application/json`. Don't forget to [authenticate](https://pipedrive.readme.io/docs/core-api-concepts-authentication) your request and add your own values to the JSON structure.
    
    
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();
    
    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    
    async function addFilter() {
        try {
            console.log('Sending request...');
    
            const api = new pipedrive.FiltersApi(defaultClient);
    
            const conditions = {
                glue: 'and',
                conditions: [
                    {
                        glue: 'and',
                        conditions: [
                            {
                                object: 'deal',
                                field_id: 12456,
                                operator: '>',
                                value: 1000,
                                extra_value: null
                            }
                        ]
                    },
                    {
                        glue: 'or',
                        conditions: [
                            {
                                object: 'deal',
                                field_id: 12464,
                                operator: '=',
                                value: 'won',
                                extra_value: null
                            }
                        ]
                    }
                ]
            }
            const data = {
                name: 'Api Filter',
                conditions,
                type: 'deals' // deals, org, people, products, activity
            }
            const response = await api.addFilter(data);
    
            console.log('Filter was added successfully!', response);
        } catch (err) {
            const errorToLog = err.context?.body || err;
    
            console.log('Adding failed', errorToLog);
        }
    }
    
    addFilter();
    

Next 


---

**Source:** https://developers.pipedrive.com/tutorials/adding-filter-pipedrive-api
