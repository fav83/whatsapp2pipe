# Responses

[ __Suggest Edits](/edit/core-api-concepts-responses)

All data is sent and received as JSON.

Each response sent from the API contains a `success` parameter, which is of boolean type, indicating whether the request was successful. Upon success being false, an optional `error` parameter (string) may be given. In case of success is true, the response is always contained within a data parameter, and additional metadata may be carried inside an `additional_data` parameter.

## 

Success response

[](#success-response)

All success responses follow the same schema:

JSON
    
    
    {
        success: true, //boolean, shows if operation succeeded (similar to HTTP status)
        data: null, //object in other cases
        additional_data: {
            pagination: { //for endpoints that list data
                start: 0,
                limit: 100,
                more_items_in_collection: false
            }
        }
    }
    

## 

Error response

[](#error-response)

All error responses follow the same schema:

JSON
    
    
    {
        success: false,
        error: "Requested service is not available", //main error message
        error_info: "Please check developers.pipedrive.com",
        data: null,
        additional_data: null
    }
    

Error response in the scenario when a customer's account hits a limit for either Deal, custom field, Role or Team creation with the HTTP error code `403`: 

JSON
    
    
    {
        "success": false,
        "error": "Couldn't add the deal. Open deals limit reached.",
        "error_info": "Please check developers.pipedrive.com for more information about Pipedrive API.",
        "data": null,
        "additional_data": null,
        "code": "feature_capping_deals_limit"
    }
    

__Updated 7 months ago

* * *

Read next

  * [Date format](/docs/core-api-concepts-date-format)


