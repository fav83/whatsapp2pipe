# New Search API migration guide

Published April 8, 2020

[ __Suggest Edits](/edit/new-search-api-migration-guide)

We have announced 6 new endpoints and the removal of 6 old endpoints with Search capability, read more about it [here](https://developers.pipedrive.com/changelog/post/removal-of-the-find-searchresults-and-searchresultsfield-endpoints-replaced-by-6-new-endpoints).

If you are using any of the deprecated endpoints from the announced list, in this guide you'll get some pointers on how to painlessly migrate to new search endpoints.

If you have any questions or need help, feel free to post to our [Dev Community](https://devcommunity.pipedrive.com/). 

> ## 📘
> 
> These are the endpoints affected by the changes:
> 
>   * `GET /deals/find`
>   * `GET /persons/find`
>   * `GET /organizations/find`
>   * `GET /products/find`
>   * `GET /searchResults`
>   * `GET /searchResults/field`
> 


When adding values to the paths, we accept the following values:

  * All boolean arguments accept both `1` or `0` and `true` or `false`. 
  * All arguments are accepted in **snake_case** and **camelCase**. 

  


* * *

## 

Multiple endpoint query migration

[](#multiple-endpoint-query-migration)

* * *

If you are using several of these endpoints at once, you can now merge them into a single call, for example:

Previous path| New path  
---|---  
`/deals/find?term=example`  
and  
`/persons/find?term=example`| `/itemSearch?item_types=deal,person&fields=title,name&term=example`  
  
  


* * *

## 

GET /deals/find migration

[](#get-dealsfind-migration)

* * *

Previous path| New path  
---|---  
`/deals/find?term=example`  
  
  
  


* * *

| `/deals/search?fields=title&term=example`  
or  
`/itemSearch?item_types=deal&fields=title&term=example`  


* * *  
  
`/deals/find?term=example&person_id=21&org_id=42`| `/deals/search?fields=title&term=example&person_id=21&organization_id=42`  
  
If you want to include a previously existing `cc_email` field for each result, include the parameter `include_fields=deal.cc_email`.

  


* * *

## 

GET /persons/find migration

[](#get-personsfind-migration)

* * *

Previous path| New path  
---|---  
`/persons/find?term=example`  
  
  
  


* * *

| /`persons/search?fields=name&term=example`  
or  
`/itemSearch?item_types=person&fields=name&term=example`  


* * *  
  
`/persons/find?term=example&org_id=42`  
  


* * *

| `/persons/search?fields=name&term=example&organization_id=42`  


* * *  
  
`/persons/find?term=example&search_by_email=1`| `/persons/search?fields=email&term=example`  
or  
`/itemSearch?item_types=person&fields=email&term=example`  
  
If you want to include a previously existing `picture` field for each result, include the parameter `include_fields=person.picture`.

  


* * *

## 

GET /organizations/find migration

[](#get-organizationsfind-migration)

* * *

Previous path| New path  
---|---  
`/organizations/find?term=example`| `/organizations/search?fields=name&term=example`  
or  
`/itemSearch?item_types=organization&fields=name&term=example`  
  
  


* * *

## 

GET /products/find migration

[](#get-productsfind-migration)

* * *

Previous path| New path  
---|---  
`/products/find?term=example`| `/products/search?fields=name&term=example`  
or  
`/itemSearch?item_types=product&fields=name&term=example`  
  
If you want to include the price of the product in the result, include the parameter `include_fields=product.price`, which will include all the product prices with their respective currencies.

  


* * *

## 

GET /searchResults migration

[](#get-searchresults-migration)

* * *

Previous path| New path  
---|---  
`/searchResults?term=example`| `/itemSearch?term=example&search_for_related_items=1`  
  
Please consider if your use-case needs searching for related items functionality (see the `[itemSearch](https://developers.pipedrive.com/docs/api/v1/ItemSearch)` endpoint description for details). Omit it if not. The endpoint will be twice as fast without it.

Previous path| New path  
---|---  
`/searchResults?term=example&item_type=deal`  
  
  


* * *

| `/itemSearch?item_types=deal&term=example&search_for_related_items=1`  


* * *  
  
`/searchResults?term=example&exact_match=1`| `/itemSearch?item_types=deal&term=example&exact_match=1`  
  
  


* * *

## 

GET /searchResults/field migration

[](#get-searchresultsfield-migration)

* * *

The `GET /searchResults/field` endpoint parameters and format are 1:1 the same as `GET /itemSearch/field` and no changes are required. 

Both `GET /searchResults/field` and `GET /itemSearch/field` **will be supported indefinitely** , but `GET /searchResults/field` will be **unlisted from the public API** and the usage of `GET /itemSearch/field` is **strongly encouraged** from now on for consistent naming with the `GET /itemSearch` endpoint in the public API. 

We still recommend renaming usages of `GET /searchResults/field` to `GET /itemSearch/field` to make it easier to look up API documentation in the future when `GET /searchResults/field` has been unlisted.  
  


__Updated over 2 years ago

* * *
