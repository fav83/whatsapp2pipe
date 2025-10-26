# Pagination

[ __Suggest Edits](/edit/core-api-concepts-pagination)

Pipedrive offers pagination for most of our API’s list and item collection endpoints.

* * *

## 

Cursor pagination

[](#cursor-pagination)

* * *

As the name suggests, cursor-based pagination uses cursors to page through the endpoint’s results. Performance-wise, it is the most efficient and stable pagination method for traversing through large amounts of entities. Inside the Pipedrive API, we support cursor-based pagination for the following endpoints:

  * [All v2 API list endpoints](/docs/pipedrive-api-v2)
  * [`GET /v1/activities/collection`](https://developers.pipedrive.com/docs/api/v1/Activities#getActivitiesCollection)
  * [`GET /v1/deals/collection`](https://developers.pipedrive.com/docs/api/v1/Deals#getDealsCollection)
  * [`GET /v1/organizations/collection`](https://developers.pipedrive.com/docs/api/v1/Organizations#getOrganizationsCollection)
  * [`GET /v1/persons/collection`](https://developers.pipedrive.com/docs/api/v1/Persons#getPersonsCollection)
  * [`GET /v1/deals/{id}/participantsChangelog`](https://developers.pipedrive.com/docs/api/v1/Deals#getDealParticipantsChangelog)
  * [`GET /v1/deals/{id}/changelog`](https://developers.pipedrive.com/docs/api/v1/Deals#getDealChangelog)
  * [`GET /v1/persons/{id}/changelog`](https://developers.pipedrive.com/docs/api/v1/Persons#getPersonChangelog)
  * [`GET /v1/organizations/{id}/changelog`](https://developers.pipedrive.com/docs/api/v1/Organizations#getOrganizationChangelog)
  * [`GET /v1/projects` endpoints with pagination](https://developers.pipedrive.com/docs/api/v1/Projects)
  * [`GET /v1/projectTemplates`](https://developers.pipedrive.com/docs/api/v1/ProjectTemplates#getProjectTemplates)
  * [`GET /v1/tasks`](https://developers.pipedrive.com/docs/api/v1/Tasks#getTasks)



Cursor-based endpoints accept the `cursor` and `limit` query parameters. A `cursor` is a marker indicating the next page’s first item. By specifying the `limit`, you can control the number of entities returned per page. The maximum `limit` value is 500.

|   
---|---  
`cursor (string)`| A marker (an opaque string value) representing the first item on the next page  
`limit (integer)`| For pagination, the limit of entries to be returned. If not provided, 100 items will be returned.  
  
**Example request for the`GET /v1/activities/collection` endpoint:**

JSON
    
    
    GET https://{COMPANYDOMAIN}.pipedrive.com/api/v1/activities/collection?cursor=eyJhY3Rpdml0eSI6NDJ9&limit=100
    

Within the response’s `additional_data` object, the `next_cursor` field will be returned, indicating the first item on the next page. The value of the `next_cursor` field will be `null` if you have reached the end of the dataset and there are no more pages to be returned.

**Example response:**

JSON
    
    
    {
        "success": true,
        "data": [
            {
               … // returned activities’ data
            }
        ],
        "additional_data": {
            "next_cursor": "eyJhY3Rpdml0aWVzIjoyN30"
        }
    }
    

  


* * *

## 

Offset pagination

[](#offset-pagination)

* * *

With the rest of our GET endpoints, we offer offset-based pagination. The parameters that control this type of pagination are `start` and `limit`, indicating the desired offset and the number of items to be returned per page.

|   
---|---  
`start (integer)`| Pagination start.  
If omitted, the default value is 0.  
`limit (integer)`| The number of items shown per page. If not provided, 100 items will be returned.  
  
**Example request for the`GET /v1/activities` endpoint:**

JSON
    
    
    GET https://{COMPANYDOMAIN}.pipedrive.com/api/v1/activities?start=0&limit=100
    

Within the response’s `additional_data` object, a pagination object will be returned. The `additional_data.pagination` object will contain the given `start` and `limit` values, as well as the `more_items_in_collection` flag, indicating whether more items can be fetched after the current batch.

If more items can be fetched, the `next_start` field, which can be used for specifying the next offset pointer, will also be returned.

The maximum `limit` value is 500.

**Example response:**

JSON
    
    
    {
        "success": true,
        "data": [
            {
               … // returned activities’ data
            }
        ],
        "additional_data": {
            "pagination": {
                "start": 0,
                "limit": 10,
                "more_items_in_collection": true,
                "next_start": 10
            }
        }
    }
    

__Updated 7 months ago

* * *

Read next

  * [HTTP status codes](/docs/core-api-concepts-http-status-codes)
  * [Using Pagination to retrieve all Deal Titles](/docs/using-pagination-to-retrieve-all-deal-titles)


