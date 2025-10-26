# Rate limiting

[ __Suggest Edits](/edit/core-api-concepts-rate-limiting)

> ##  📘
> 
> To maintain high performance standards and ensure fair resource access across all users, **token-based rate limits** will be introduced for **API** usage. This change will affect new and existing customers according to the following schedule:
> 
>   * **New Customers:** Starting on **December 2nd, 2024** , all new signups will operate under the token-based rate limiting system from the outset.
>   * **Existing Customers:** For current accounts, rate limits will be gradually rolled out beginning **March 1st, 2025** , with the process scheduled to complete by **Dec 31st, 2025**. This phased rollout is designed to provide time for any necessary adjustments.
> 


**Rate limiting** is a system used to control the number of requests an application can make to an API within a specific timeframe. It ensures fair resource usage across all users and protects the platform from being overwhelmed by high-volume requests. By setting usage limits, rate limiting helps maintain stable performance, reduce server load, and prevent any single application from monopolizing resources at the expense of others.

* * *

## 

Token-Based Rate Limiting

[](#token-based-rate-limiting)

* * *

With token-based rate limiting, each request consumes a certain number of tokens from a set daily allowance, or “budget.” Once this budget is exhausted, further requests will be temporarily blocked until the budget resets at the start of the next day.

Unlike traditional request-based rate limiting, which restricts the sheer number of requests regardless of their complexity, **token-based rate limiting** offers a more flexible and efficient approach. This method allows lightweight requests to consume fewer tokens, while more resource-intensive API calls are assigned a higher token cost. By adapting the “charge” based on the complexity of each request, token-based rate limiting provides greater freedom to execute frequent, low-impact operations without hitting limits prematurely, while still protecting the platform from heavy resource usage.

> ## 📘
> 
> You can view the token costs for each API endpoint in our [API Reference](https://developers.pipedrive.com/docs/api/v1).

Token-based rate limiting is widely used across the industry as a fair and scalable approach to managing API usage. It ensures that both lightweight and complex API interactions are accommodated efficiently, balancing performance and access.

### 

Tokens Daily Budget

[](#tokens-daily-budget)

Each company account is allocated a daily **API token budget** , which is shared among all users within that account. This budget is exclusively for API traffic authenticated by API tokens or OAuth tokens, and it does not impact actions performed directly within the Pipedrive user interface.

The daily token budget is calculated using the following formula:

**30,000 base tokens × subscription plan multiplier × number of seats (+ purchased API Token top-ups)**

Plan| Plan multiplier  
---|---  
Lite| 1  
Growth| 2  
Premium| 5  
Ultimate| 7  
  
> ## 📘
> 
> Tokens budget resets at midnight at server’s timezone which **may not be aligned** with timezone of customer location.

### 

API Requests

[](#api-requests)

Each API request consumes a specific number of tokens, with each API endpoint assigned cost in tokens based on the complexity and resource demand of the endpoint. When a request is made, the corresponding token cost is deducted from the company’s daily API budget. Lightweight endpoints consume fewer tokens, while more complex or data-intensive endpoints require a higher token cost.

> ## 📘
> 
> You can view the token costs for each API endpoint in our [API Reference](https://developers.pipedrive.com/docs/api/v1).

Costs for _**some**_ of the API operations are listed below:

API Endpoint type| Cost in tokens  
---|---  
Get single entity| 2  
Get list of entities| 20  
Update single entity| 10  
Delete single entity| 6  
Delete list of entities| 10  
Search for entities| 40  
  
> ## 📘
> 
> Available **API v2 endpoints** are performance-optimized, resulting in lower token costs compared to the original v1 endpoints. [Learn more here](/docs/guide-for-optimizing-api-usage#using-api-v2-endpoints).

### 

Exceeding the tokens budget

[](#exceeding-the-tokens-budget)

When the daily API token budget is close to being fully consumed, automated notifications will be sent to the company administrators to provide visibility and allow for any necessary adjustments.

> ## 📘
> 
>   * **75% Notification:** When usage reaches 75% of the daily budget, an automated email will be sent to the company administrators. This notification is intended as an early warning, giving time to review API usage or adjust integrations if needed.
>   * **100% Notification:** Upon reaching 100% of the daily token budget, a second email notification will be sent to inform the administrator that the budget has been exhausted.
> 


Once the daily budget is fully depleted, all further API requests will be**rejected with a 429 (Too Many Requests)** status code. These requests will remain blocked until the budget resets the following day, at the designated reset time based on the server’s timezone

> ## 📘
> 
> Tokens budget resets at midnight at server’s timezone which **may not be aligned** with timezone of customer location.

To avoid interruptions, administrators may wish to monitor API usage closely and consider adjusting their usage patterns. Additionally, it is possible to increase the budget allocation by upgrading to a higher plan, adding more seats, or purchasing API Token top-ups. For more information about available top-ups, visit this [Pipedrive Knowledge Base article](https://support.pipedrive.com/en/article/top-ups).

The company’s API usage statistics can be found in the **API Usage Dashboard** within Company Settings.

* * *

## 

Burst limits

[](#burst-limits)

* * *

In addition to the daily token-based rate limits, **burst rate limits** are in place to prevent a large number of tokens from being consumed in a short period. These burst limits are designed to protect against rapid, high-volume API calls that could deplete the entire daily budget too quickly, potentially locking a company out from API access until the next daily reset.

### 

How do Burst Limits Work?

[](#how-do-burst-limits-work)

Burst rate limits apply at the individual user level within each company account, operating on a rolling 2-second window. This means that each user has a maximum allowable number of requests within any 2-second timeframe, based on the company’s subscription plan. These limits prevent sudden spikes in usage, helping to maintain consistent access to the API throughout the day.

### 

Limits

[](#limits)

> ## 📘
> 
> Burst rate limiting of the Pipedrive API is considered **per token** , not per company.

Plan| API token limits| OAuth apps limits  
---|---|---  
Lite| 20 requests per 2 seconds| 80 requests per 2 seconds  
Growth| 40 requests per 2 seconds| 160 requests per 2 seconds  
Premium| 100 requests per 2 seconds| 400 requests per 2 seconds  
Ultimate| 120 requests per 2 seconds| 480 requests per 2 seconds  
  
The Search API has unique burst limits that are consistent across all authentication types and subscription plans:

Plan| API limit  
---|---  
Lite| 10 requests per 2 seconds  
Growth| 10 requests per 2 seconds  
Premium| 10 requests per 2 seconds  
Ultimate| 10 requests per 2 seconds  
  
### 

HTTP headers and response codes

[](#http-headers-and-response-codes)

Pipedrive burst limits have the following response headers:

Header| Description  
---|---  
`x-ratelimit-limit`| The maximum number of requests current `access_token` or `api_token` can perform per 2-second window.  
`x-ratelimit-remaining`| The number of requests left for the 2-second window.  
`x-ratelimit-reset`| The remaining window before the rate limit resets.  
`x-daily-requests-left`| Indicates how many requests you can still make to `POST`/`PUT` endpoints during the ongoing day (calculated in UTC). Applicable only to `api_token` requests.  
  
* * *

## 

Limiting high volume traffic

[](#limiting-high-volume-traffic)

* * *

> ## 🚧
> 
> Only the high volume traffic coming from `api_token` integrations will be blocked.

In order to protect ourselves from online attacks caused by misconfigured API integrations, users abusing our system by not respecting our rate limits and keeping up the high volume of traffic despite getting the `429` response code, will also get the `403` response code. When getting the `403` response code, the answer will be an HTML error page with the message "This error is produced by **Cloudflare**. See troubleshooting guide [here](https://support.cloudflare.com/hc/en-us/articles/360029779472-Troubleshooting-Cloudflare-1XXX-errors).", informing the user that one’s **access** has been **denied** :

![](https://files.readme.io/e7713d9-image.png)

Please note that this improvement will not impact the vast majority of users, even if our API is heavily used. If this impacts you, please review your integration and remove any misconfiguration that might lead you to be blocked.

* * *

## 

How to avoid being rate limited

[](#how-to-avoid-being-rate-limited)

* * *

If you're reaching the rate limit, options to improve performance include **restructuring** the integration architecture, using [Webhooks](/docs/guide-for-webhooks), and/or upgrading to a higher plan. Learn more about optimizing API usage [here](/docs/guide-for-optimizing-api-usage).

__Updated 26 days ago

* * *

Read next

  * [Responses](/docs/core-api-concepts-responses)


