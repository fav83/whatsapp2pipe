# Guide for optimizing API usage

[ __Suggest Edits](/edit/guide-for-optimizing-api-usage)

## 

Rate Limiting Overview

[](#rate-limiting-overview)

* * *

**Rate limiting** is a strategy widely used in APIs to control the frequency of requests made to a server within a given timeframe. It prevents overloading resources by distributing access fairly and maintaining consistent platform performance for all users. In token-based rate limiting, each API request “spends” a number of tokens from a customer’s daily allowance, with different endpoints consuming varying token amounts based on their complexity.

For developers, understanding rate limiting is key to building applications that operate smoothly within set limits, especially when serving multiple end users. This guide provides best practices and optimization techniques to help third-party applications remain efficient and stay within their token budgets.

> ## 📘
> 
> Each Pipedrive account is allocated a specific daily token budget, calculated based on the number of seats and the pricing plan associated with the account. This budget is shared among all users within the account, meaning that each API request made by any user or integration will draw from the same pool of tokens
> 
> For Marketplace applications using OAuth authentication, tokens are drawn from the end-user’s account budget. Exceeding the token budget on one account will not impact other accounts using the same application.

* * *

## 

Using API v2 Endpoints

[](#using-api-v2-endpoints)

* * *

Each API endpoint has an associated “token cost” based on its complexity. In 2024, Pipedrive introduced a selection of optimized **API v2 endpoints** designed to improve performance and reduce token usage. By switching to API v2, developers can achieve significantly faster response times and benefit from token costs that are up to half the cost of the original endpoints. APIv2 endpoints also provide stricter data typing and enhanced validation for input data, ensuring more robust and reliable interactions. Learn more in the [Pipedrive API v2 overview](/docs/pipedrive-api-v2) or consult the [Pipedrive API v2 migration guide](/docs/pipedrive-api-v2-migration-guide) for assistance.

> ## 🚧
> 
> Please note that API v2 endpoints are not backward compatible with API v1. The official Pipedrive SDK currently does not support API v2; however, an updated version of the SDK with API v2 compatibility is planned for release in Q1 2025.

* * *

## 

Reducing Excessive API Requests: Alternatives to Polling

[](#reducing-excessive-api-requests-alternatives-to-polling)

* * *

Frequent API polling, or repeatedly fetching the same endpoint to obtain the latest data, can quickly deplete the daily token budget and lead to rate limiting. Instead of polling, developers are encouraged to use available tools and methods to manage API usage effectively.

  * **Respect Rate Limit Headers and 429 Responses:** The Rate Limit Headers provide information on remaining token counts and reset times, allowing developers to monitor and manage request frequency. Implementing a delay or backoff strategy in response to 429 (Too Many Requests) responses can help avoid exceeding the daily budget.
  * **Use Webhooks Where Possible:** Where applicable, implement [webhooks](/docs/guide-for-webhooks-v2) to receive real-time event updates instead of continuously polling the API. Webhooks provide callbacks for specific events, reducing the need for repetitive API calls.



These strategies help optimize API usage while ensuring the application stays within the daily token limits.

* * *

## 

Implementing a Caching Layer

[](#implementing-a-caching-layer)

* * *

Adding a caching layer to store previously retrieved data can significantly reduce the number of API requests, improving application efficiency and conserving the daily token budget. By temporarily storing frequently accessed data, caching allows for faster access to information without repeatedly calling the same endpoints.

  * **Use Cache for Faster Access:** Storing data in cache minimizes the need to request the same information multiple times, enhancing response times and reducing API token consumption.
  * **Leverage`updated_since` and `updated_until` parameters:** Many API endpoints include updated_sinceand updated_until parameters to retrieve data only from specific timeframes. Using these parameters allows developers to fetch only new or updated data since the last check, further reducing the volume of requests.
  * **Invalidate Cache with Webhooks:** Subscribing to relevant events via **webhooks** helps keep the cache up to date. When changes occur, webhooks notify the application, signaling when cached data may need refreshing.



Implementing a caching layer, combined with these strategies, ensures efficient data access while helping to stay within the daily API limits.

* * *

## 

Stay Informed on API Changes

[](#stay-informed-on-api-changes)

* * *

Keeping up-to-date with API changes is essential for maintaining optimized and efficient API usage. New features, updated endpoints, or enhanced versions like API v2 can offer improved performance and reduced token costs.

  * **Check API Changelogs regularly:** The [Changelog](https://developers.pipedrive.com/changelog) provides updates on endpoint changes, optimizations, or newly added features. By monitoring this log, developers can take advantage of performance enhancements and ensure compatibility with the latest updates.
  * **Explore optimized endpoints:** Newer versions, such as [API v2](/docs/pipedrive-api-v2), are often more efficient in both response times and token costs. Transitioning to optimized endpoints can help significantly reduce API expenses over time, making it worthwhile to consider updates or migration when they become available.
  * **Join Developers' Community discussions:** Engaging in developer communities or forums can provide insight into best practices and optimization strategies others are using. [Pipedrive’s Developers' Community](https://devcommunity.pipedrive.com/) offers a space to discuss changes, get help, and learn about upcoming API improvements directly from other developers and support teams.



Staying informed and proactive about API changes allows developers to build more efficient applications, reduce token usage, and prevent potential service interruptions.

__Updated 7 months ago

* * *
