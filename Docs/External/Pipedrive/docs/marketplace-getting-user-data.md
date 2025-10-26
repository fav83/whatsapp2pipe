# Getting user data

[ __Suggest Edits](/edit/marketplace-getting-user-data)

After you've obtained a valid access token, you can get user's info by requesting the [`/users/me`](https://developers.pipedrive.com/docs/api/v1/Users#getCurrentUser) API endpoint. This is a very important endpoint that returns all the basic info like:

  * user email
  * name
  * bound company data: company ID, company name, and domain



You may use this data to create or link user accounts existing in your service with Pipedrive account. Don't use email as a unique identifier for creating accounts, it's better to use the combination of `user_id` and `company_id` (which you can get from the [`/users/me`](https://developers.pipedrive.com/docs/api/v1/Users#getCurrentUser) response) as the guaranteed unique identifier.

This endpoint also returns the current user's locale, which app developers could use in their installation process to detect in which language the content is displayed at their callback URL.

This is how [`/users/me`](https://developers.pipedrive.com/docs/api/v1/Users#getCurrentUser) response JSON looks like: 

JSON
    
    
    {
      "success": true,
      "data": {
        "id": 777,
        "name": "James Bond",
        "default_currency": "USD",
        "locale": "en_US",
        "lang": 1,
        "email": "[[email protected]](/cdn-cgi/l/email-protection)",
        "phone": null,
        "activated": true,
        "last_login": "2017-12-18 08:43:13",
        "created": "2017-11-08 12:00:22",
        "modified": "2017-12-18 08:43:13",
        "signup_flow_variation": "short_form",
        "has_created_company": true,
        "is_admin": 1,
        "timezone_name": "Europe/Helsinki",
        "timezone_offset": "+02:00",
        "active_flag": true,
        "role_id": 1,
        "icon_url": "https://d3myhnqlqw2314.cloudfront.net/profile_120x120_622732_a30ce0fa4cb31e36aa1ee42f1bc271d9.jpg",
        "is_you": true,
        "company_id": 1,
        "company_name": "MI6",
        "company_domain": "casinoroyale",
        "company_country": "EE",
        "company_industry": "Software, App Development",
        "language": {
          "language_code": "en",
          "country_code": "US"
        }
      }
    }
    

> ## 🚧
> 
> Have in mind that a Pipedrive user may have more than one company, so `access_token` is bound to user and company.

This means that when attempting authorization, your service will return you tokens for the Pipedrive user and the company that was active during the OAuth authorization process. In order to distinguish companies from the same Pipedrive user, the combination of `user_id` and `company_id` is the guaranteed unique identifier.  
  


__Updated 7 months ago

* * *

Read next

  * [How to get the company domain](/docs/how-to-get-the-company-domain)
  * [Webhooks for apps](/docs/webhooks-for-apps)


