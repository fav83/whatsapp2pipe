# Scopes and permission explanations

[ __Suggest Edits](/edit/marketplace-scopes-and-permissions-explanations)

Every time you create an app for the Pipedrive Marketplace, you'll need to determine what kind of user-related data you need access to. We use scopes for that.

**Scopes** are used to limit an app's access to user-related data and they'll let you specify exactly what kind of access you need.

On the other hand, it's also important for the user to know exactly what the app can and cannot do with the data in their Pipedrive account. Once a user permits access to their data, each scope will define the endpoints the app has access to. 

> ## 🚧
> 
> The user has the option to **either accept or deny all scopes**. Because of this, it's a good idea to **build apps that only request scopes that are absolutely necessary** for your particular use case.

> ## 📘
> 
> If you need to **change the scopes** of an already existing app, be sure to read more about how it can affect your app's users [here](/docs/marketplace-updating-the-existing-app#changing-the-scopes).

  


* * *

## 

List of scopes

[](#list-of-scopes)

* * *

Here's our mapping of API endpoints to access scopes:

Scope| Name in Developer Hub with description| Endpoints grouped under this scope  
---|---|---  
base| **Access to basic information**  
Read the settings of the authorized user and currencies in an account.  
⚠️ _This is the default permission that is always enabled for all apps._|  GET /users/me  
GET /userConnections  
GET /userSettings  
GET /currencies  
deals:read| **Deals: Read only**  
Read most of the data about deals and related entities - deal fields, products, followers, participants; all notes, files, filters, pipelines, stages, and statistics. Does not include access to activities (except the last and next activity related to a deal).| GET /deals/collection  
GET /deals/search  
GET /deals/timeline  
GET /deals/timeline/archived  
GET /deals/{id}  
GET /deals  
GET /deals/archived  
GET /dealFields  
GET /dealFields/{id}  
GET /deals/{id}/files  
GET /deals/{id}/participantsChangelog  
GET /persons/{id}/deals  
GET /pipelines/{id}/deals  
GET /pipelines/{id}/conversion_statistics  
GET /pipelines/{id}/movement_statistics  
GET /products/{id}/deals  
GET /notes  
GET /notes/{id}  
GET /notes/{id}/comments  
GET /notes/{id}/comments/{commentId}  
GET /noteFields  
GET /deals/{id}/followers  
GET /deals/{id}/permittedUsers  
GET /files  
GET /files/{id}  
GET /files/{id}/download  
GET /deals/{id}/participants  
GET /stages  
GET /stages/{id}  
GET /stages/{id}/deals  
GET /pipelines  
GET /pipelines/{id}  
GET /filters  
GET /filters/{id}  
GET /filters/helpers  
GET /organizations/{id}/deals  
GET /deals/summary  
GET /deals/summary/archived  
GET /subscriptions/{id}  
GET /subscriptions/find/{id}  
GET /subscriptions/{id}/payments  
GET /deals/{id}/discounts  
GET /deals/{id}/discounts/{id}  
GET /deals/{id}/convert/status/{conversion_id}  
GET /deals/installments  
deals:full| **Deals: Full access**  
Create, read, update and delete deals, its participants and followers; all files, notes, and filters. It also includes read access to deal fields, pipelines, stages, and statistics. Does not include access to activities (except the last and next activity related to a deal).| POST /deals  
POST /deals/{id}/duplicate  
PUT /deals/{id}  
PUT /deals/{id}/merge  
DELETE /deals/{id}  
DELETE /deals  
POST /files/remote  
POST /files/remoteLink  
POST /deals/{id}/followers  
POST /deals/{id}/products  
DELETE /deals/{id}/products/{product_attachment_id}  
PUT /deals/{id}/products/{product_attachment_id}  
POST /notes  
PUT /notes/{id}  
DELETE /notes/{id}  
POST /files  
POST /notes/{id}/comments  
PUT /notes/{id}/comments/{commentId}  
DELETE /notes/{id}/comments/{commentId}  
POST /files  
PUT /files/{id}  
DELETE /files/{id}  
POST /deals/{id}/participants  
POST /filters  
PUT /filters/{id}  
DELETE /filters  
DELETE /filters/{id}  
GET /deals/collection  
GET /deals/search  
GET /deals/summary  
GET /deals/summary/archived  
GET /deals/timeline  
GET /deals/timeline/archived  
GET /deals/{id}  
GET /deals  
GET /deals/archived  
GET /dealFields  
GET /dealFields/{id}  
GET /deals/{id}/files  
GET /deals/{id}/participantsChangelog  
GET /persons/{id}/deals  
GET /pipelines/{id}/deals  
GET /pipelines/{id}/conversion_statistics  
GET /pipelines/{id}/movement_statistics  
GET /products/{id}/deals  
GET /notes  
GET /notes/{id}  
GET /notes/{id}/comments  
GET /notes/{id}/comments/{commentId}  
GET /noteFields  
GET /deals/{id}/followers  
GET /deals/{id}/permittedUsers  
GET /files  
GET /files/{id}  
GET /files/{id}/download  
GET /deals/{id}/participants  
GET /stages  
GET /stages/{id}  
GET /stages/{id}/deals  
GET /pipelines  
GET /pipelines/{id}  
GET /filters  
GET /filters/{id}  
GET /filters/helpers  
GET /organizations/{id}/deals  
GET /subscriptions/{id}  
GET /subscriptions/find/{id}  
GET /subscriptions/{id}/payments  
GET /deals/{id}/discounts  
GET /deals/{id}/discounts/{id}  
POST /deals/{id}/discounts  
PATCH /deals/{id}/discounts/{id}  
DELETE /deals/{id}/discounts/{id}  
DELETE /subscriptions/{id}  
POST /subscriptions/installment  
POST /subscriptions/recurring  
PUT /subscriptions/installment/{id}  
PUT /subscriptions/recurring/{id}  
PUT /subscriptions/recurring/{id}/cancel  
DELETE /deals/{id}/followers/{id}  
DELETE /deals/{id}/participants/{id}  
POST /deals/{id}/convert/lead  
GET /deals/{id}/convert/status/{conversion_id}  
GET /deals/installments  
POST /deals/{id}/installments  
PATCH /deals/{id}/installments/{installment_id}  
DELETE /deals{id}/installments{installment_id}  
mail:read| **Mail: Read only**  
Read mail threads and messages.| GET /deals/{id}/mailMessages  
GET /mailbox/mailMessages/{id}  
GET /mailbox/mailThreads  
GET /mailbox/mailThreads/{id}  
GET /mailbox/mailThreads/{id}/mailMessages  
GET /persons/{id}/mailMessages  
GET /organizations/{id}/mailMessages  
mail:full| **Mail: Full access**  
Read, update and delete mail threads. Also grants read access to mail messages.| PUT /mailbox/mailThreads/{id}  
DELETE /mailbox/mailThreads/{id}  
GET /deals/{id}/mailMessages  
GET /mailbox/mailMessages/{id}  
GET /mailbox/mailConnections  
GET /mailbox/mailThreads  
GET /mailbox/mailThreads/{id}  
GET /mailbox/mailThreads/{id}/mailMessages  
GET /persons/{id}/mailMessages  
GET /organizations/{id}/mailMessages  
activities:read| **Activities: Read only**  
Read activities, its fields and types; all files and filters.| GET /activities  
GET /activities/collection  
GET /activities/{id}  
GET /activityFields  
GET /activityTypes  
GET /deals/{id}/activities  
GET /persons/{id}/activities  
GET /files  
GET /files/{id}  
GET /files/{id}/download  
GET /filters  
GET /filters/{id}  
GET /filters/helpers  
GET /organizations/{id}/activities  
GET /users/{id}/activities  
activities:full| **Activities: Full access**  
Create, read, update and delete activities and all files and filters. Also includes read access to activity fields and types.| POST /activities  
PUT /activities/{id}  
DELETE /activities  
DELETE /activities/{id}  
POST /files/remote  
POST /files/remoteLink  
POST /files  
PUT /files/{id}  
DELETE /files/{id}  
POST /filters  
PUT /filters/{id}  
DELETE /filters  
DELETE /filters/{id}  
GET /activities  
GET /activities/collection  
GET /activities/{id}  
GET /activityFields  
GET /activityTypes  
GET /deals/{id}/activities  
GET /persons/{id}/activities  
GET /files  
GET /files/{id}  
GET /files/{id}/download  
GET /filters  
GET /filters/{id}  
GET /filters/helpers  
GET /organizations/{id}/activities  
GET /users/{id}/activities  
contacts:read| **Contacts: Read only**  
Read the data about persons and organizations, their related fields and followers; also all notes, files, filters.| GET /deals/{id}/persons  
GET /persons/search  
GET /persons/{id}  
GET /persons/{id}/files  
GET /persons/{id}/products  
GET /persons  
GET /personFields  
GET /personFields/{id}  
GET /persons/{id}/followers  
GET /persons/{id}/permittedUsers  
GET /organizationFields  
GET /organizationFields/{id}  
GET /organizations/{id}/files  
GET /organizations/{id}/persons  
GET /organizations/search  
GET /organizations/{id}  
GET /organizations  
GET /organizationRelationships  
GET /organizationRelationships/{id}  
GET /organizations/{id}/followers  
GET /organizations/{id}/permittedUsers  
GET /notes  
GET /notes/{id}  
GET /notes/{id}/comments  
GET /notes/{id}/comments/{commentId}  
GET /noteFields  
GET /files  
GET /files/{id}  
GET /files/{id}/download  
GET /filters  
GET /filters/{id}  
GET /filters/helpers  
contacts:full| **Contacts: Full access**  
Create, read, update and delete persons and organizations and their followers; all notes, files, filters. Also grants read access to contacts-related fields.| POST /persons  
POST /persons/{id}/picture  
PUT /persons/{id}  
PUT /persons/{id}/merge  
DELETE /persons/{id}  
DELETE /persons/{id}/picture  
DELETE /persons  
POST /persons/{id}/followers  
DELETE /persons/{id}/followers/{follower_id}  
POST /files/remote  
POST /files/remoteLink  
POST /organizations  
PUT /organizations/{id}  
PUT /organizations/{id}/merge  
DELETE /organizations  
DELETE /organizations/{id}  
POST /organizationRelationships  
PUT /organizationRelationships/{id}  
DELETE /organizationRelationships/{id}  
POST /organizations/{id}/followers  
DELETE /organizations/{id}/followers/{follower_id}  
POST /notes  
PUT /notes/{id}  
DELETE /notes/{id}  
POST /files  
PUT /files/{id}  
DELETE /files/{id}  
POST /filters  
PUT /filters/{id}  
DELETE /filters  
DELETE /filters/{id}  
GET /deals/{id}/persons  
GET /persons/search  
GET /persons/{id}  
GET /persons/{id}/files  
GET /persons/{id}/products  
GET /persons  
GET /personFields  
GET /personFields/{id}  
GET /persons/{id}/followers  
GET /persons/{id}/permittedUsers  
GET /organizationFields  
GET /organizationFields/{id}  
GET /organizations/{id}/files  
GET /organizations/{id}/persons  
GET /organizations/search  
GET /organizations/{id}  
GET /organizations  
GET /organizationRelationships  
GET /organizationRelationships/{id}  
GET /organizations/{id}/followers  
GET /organizations/{id}/permittedUsers  
GET /notes  
GET /notes/{id}  
GET /notes/{id}/comments  
GET /notes/{id}/comments/{commentId}  
GET /noteFields  
GET /files  
GET /files/{id}  
GET /files/{id}/download  
GET /filters  
GET /filters/{id}  
GET /filters/helpers  
products:read| **Products: Read only**  
Read products, its fields, files, followers and products connected to a deal.| GET /deals/{id}/products  
GET /products  
GET /products/search  
GET /products/{id}  
GET /products/{id}/files  
GET /products/{id}/images  
GET /productFields  
GET /productFields/{id}  
GET /products/{id}/followers  
GET /products/{id}/permittedUsers  
GET /products/{id}/variations  
products:full| **Products: Full access**  
Create, read, update and delete products and its fields; add products to deals.| POST /products  
PUT /products/{id}  
PUT /products/{id}/images  
POST /productFields  
PUT /productFields/{id}  
PATCH /products/{id}/variations/{id}  
POST /products/{id}/followers  
POST /products/{id}/images  
POST /products/{id}/variations  
POST /deals/{id}/products  
GET /deals/{id}/products  
GET /products  
GET /products/search  
GET /products/{id}  
GET /products/{id}/files  
GET /products/{id}/images  
GET /productFields  
GET /productFields/{id}  
GET /products/{id}/followers  
GET /products/{id}/permittedUsers  
GET /products/{id}/variations  
DELETE /products/{id}  
DELETE /products/{id}/images  
DELETE /productFields  
DELETE /productFields/{id}  
DELETE /deals/{id}/products/{product_attachment_id}  
DELETE /products/{id}/followers/{follower_id}  
DELETE /products/{id}/variations/{id}  
users:read| **Read users data**  
Read data about users (people with access to a Pipedrive account), their permissions, roles and followers.| GET /users  
GET /users/{id}  
GET /users/find  
GET /users/{id}/followers  
GET /users/{id}/roleSettings  
GET /users/{id}/permissions  
GET /legacyTeams  
GET /legacyTeams/{id}  
GET /legacyTeams/{id}/users  
GET /legacyTeams/users/{id}  
GET /users/{id}/roleAssignments  
GET /billing/subscriptions/addons  
recents:read| **See recent account activity**  
Read all recent changes occurred in an account. Includes data about activities, activity types, deals, files, filters, notes, persons, organizations, pipelines, stages, products and users.| GET /recents  
GET /deals/{id}/flow  
GET /persons/{id}/flow  
GET /organizations/{id}/flow  
search:read| **Search for all data**  
Search across the account for deals, persons, organizations, files and products, and see details about the returned results.| GET /recents  
GET /deals/search  
GET /leads/search  
GET /products/search  
GET /persons/search  
GET /organizations/search  
GET /itemSearch  
GET /itemSearch/field  
admin| **Administer account**  
Allows to do many things that an administrator can do in a Pipedrive company account - create, read, update and delete pipelines and its stages; deal, person and organization fields; activity types; users and permissions, etc. It also allows the app to create webhooks and fetch and delete webhooks that are created by the app.  
  
**Before requesting this scope, see[below](/docs/marketplace-scopes-and-permissions-explanations#permission-set-effect-on-admin-scope) how it can effect non-admin users.**| POST /stages  
PUT /stages/{id}  
DELETE /stages  
DELETE /stages/{id}  
POST /pipelines  
PUT /pipelines/{id}  
DELETE /pipelines/{id}  
GET /webhooks  
POST /webhooks  
DELETE /webhooks/{id}  
POST /users  
PUT /users/{id}  
POST /dealFields  
PUT /dealFields/{id}  
DELETE /dealFields  
DELETE /dealFields/{id}  
POST /activityTypes  
PUT /activityTypes/{id}  
DELETE /activityTypes  
DELETE /activityTypes/{id}  
POST /personFields  
PUT /personFields/{id}  
DELETE /personFields  
DELETE /personFields/{id}  
POST /organizationFields  
PUT /organizationFields/{id}  
DELETE /organizationFields  
DELETE /organizationFields/{id}  
GET /stages  
GET /stages/{id}  
GET /pipelines  
GET /pipelines/{id}  
GET /dealFields  
GET /dealFields/{id}  
GET /activityTypes  
GET /personFields  
GET /personFields/{id}  
GET /organizationFields  
GET /organizationFields/{id}  
POST /legacyTeams  
PUT /legacyTeams/{id}  
POST /legacyTeams/{id}/users  
DELETE /legacyTeams/{id}/users  
GET /permissionSets  
GET /permissionSets/{id}  
GET /permissionSets/{id}/assignments  
GET /roles  
GET /roles/{id}  
GET /roles/{id}/assignments  
GET /roles/{id}/settings  
GET /roles/{id}/pipelines  
POST /roles  
POST /roles/{id}/assignments  
POST /roles/{id}/settings  
PUT /roles/{id}  
PUT /roles/{id}/pipelines  
DELETE /roles/{id}  
DELETE /roles/{id}/assignments  
leads:read| **Leads: Read only**  
Read data about leads and lead labels.| GET /leads  
GET /leads/archived  
GET /leads/{id}  
GET /leads/{id}/permittedUsers  
GET /leadSources  
GET /leadLabels  
GET /leads/search  
GET /leads/{id}/convert/status/{conversion_id}  
leads:full| **Leads: Full access**  
Create, read, update and delete leads and lead labels.| POST /leads  
GET /leads  
GET /leads/archived  
GET /leads/search  
GET /leads/{id}  
GET /leads/{id}/permittedUsers  
PATCH /leads/{id}  
DELETE /leads/{id}  
GET /leadSources  
POST /leadLabels  
GET /leadLabels  
PATCH /leadLabels/{id}  
DELETE /leadLabels/{id}  
POST /leads/{id}/convert/deal  
GET /leads/{id}/convert/status/{conversion_id}  
phone-integration| **Call logs**  
Enables advanced call integration features like logging call duration and other metadata, and play call recordings inside Pipedrive.| POST /callLogs  
DELETE /callLogs/{id}  
POST /callLogs/{id}/recordings  
GET /callLogs  
GET /callLogs/{id}  
goals:read| **Goals: Read only**  
Read data on all goals.| GET /goals/count/by-{goalAssignee}  
GET /goals/find  
GET /goals/find-intervals/custom  
GET /goals/find-intervals/{period}  
GET /goals/{id}/results  
goals:full| **Goals: Full access**  
Create, read, update and delete goals.| GET /goals/count/by-{goalAssignee}  
GET /goals/find  
GET /goals/find-intervals/custom  
GET /goals/find-intervals/{period}  
GET /goals/{id}/results  
POST /goals  
PUT /goals/{id}  
DELETE /goals/{id}  
video-calls| **Video calls integration**  
Allows application to register as a video call integration provider and create conference links| POST /meetings/user-provider-links  
DELETE /meetings/user-provider-links/{id}  
messengers-integration| **Messaging integration**  
Allows application to register as a messengers integration provider and allows them to deliver incoming messages and their statuses| POST /channels  
POST /channels/messages/receive  
DELETE /channels/{id}  
DELETE /channels/{channel-id}/conversations/{conversation-id}  
projects:read| **Projects: Read only**  
Read data about projects and its related data, project templates and tasks.| GET /projects  
GET /projects/{id}  
GET /projects/boards  
GET /projects/boards/{id}  
GET /projects/phases  
GET /projects/phases/{id}  
GET /projects/{id}/plan  
GET /projects/{id}/activities  
GET /projects/{id}/tasks  
GET /projects/{id}/groups  
GET /tasks  
GET /tasks/{id}  
GET /projectTemplates  
GET /projectTemplates/{id}  
projects:full| **Projects: Full access**  
Create, read, update and delete projects and tasks. Gives access to read project-related data, including boards, phases, groups and project templates, as well as access to read and update project plan items.| GET /projects  
GET /projects/{id}  
GET /projects/boards  
GET /projects/boards/{id}  
GET /projects/phases  
GET /projects/phases/{id}  
GET /projects/{id}/plan  
GET /projects/{id}/activities  
GET /projects/{id}/tasks  
GET /projects/{id}/groups  
GET /tasks  
GET /tasks/{id}  
GET /projectTemplates  
GET /projectTemplates/{id}  
POST /projects  
PUT /projects/{id}  
DELETE /projects/{id}  
POST /projects/{id}/archive  
PUT /projects/{id}/plan/activities/{id}  
PUT /projects/{id}/plan/tasks/{id}  
POST /tasks  
PUT /tasks/{id}  
DELETE /tasks/{id}  
webhooks:read| **Webhooks: Read only**  
Read data about webhooks created by the app.| GET /webhooks  
webhooks:full| **Webhooks: Full access**  
Create, read and delete webhooks.| GET /webhooks  
POST /webhooks  
DELETE /webhooks/{id}  
  
  


* * *

## 

Permission set effect on admin scope

[](#permission-set-effect-on-admin-scope)

* * *

The admin scope requires the user who is installing an app (from the Pipedrive's Marketplace), to have admin rights within the company. As the Marketplace doesn't restrict non-admin users from installing apps, your app will need to be able to handle users without admin rights installing the app, when the admin scope is required.

When your app requests admin scope access, the app will need to check if it can complete all of the required functionalities/actions through a non-admin user or whether those actions would require the permissions of an Admin. If the request fails, check to see if the user is a non-admin user and/or falls under a certain permission set or a visibility group. You can check that through the [`GET /users/{id}/permissions`](https://developers.pipedrive.com/docs/api/v1/Users#getUserPermissions) endpoint. For additional information about user restrictions, you can see the list role settings - [`GET /users/{id}/roleSettings`](https://developers.pipedrive.com/docs/api/v1/Users#getUserRoleSettings) and the list user role assignments - [`GET /users/{id}/roleAssignments`](https://developers.pipedrive.com/docs/api/v1/Users#getUserRoleAssignments). 

If an admin has installed the app before any regular user, your app may work correctly for non-admin users. Example use-case: 

_Your app needs to create activities with a custom activity type. An admin user of a company has installed the app and the custom activity type has been created for their company. Now, when a regular user who's a part of the same company installs the app, your app will be able to create the activities with before created activity type._

Affected use-cases can include your **app creating, editing or deleting activity types, stages and pipelines as well as custom fields**.  
  


__Updated 10 days ago

* * *

Read next

  * [State parameter](/docs/marketplace-oauth-authorization-state-parameter)
  * [Webhooks for apps](/docs/webhooks-for-apps)
  * [Migrating existing integration users](/docs/marketplace-migrating-existing-integration-users)
  * [Handling user app uninstallation](/docs/app-uninstallation)
  * [FAQ](/docs/faq)


