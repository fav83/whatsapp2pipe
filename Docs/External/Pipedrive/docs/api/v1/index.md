# Pipedrive API v1

**Version:** 1.0.0
**OpenAPI Version:** 3.0.1

## API Endpoints by Category

### Activities
[View all Activities endpoints](./activities.md)

- [DELETE /activities](./deleteactivities.md) - Delete multiple activities in bulk
- [GET /activities](./getactivities.md) - Get all activities assigned to a particular user
- [POST /activities](./addactivity.md) - Add an activity
- [GET /activities/collection](./getactivitiescollection.md) - Get all activities collection
- [DELETE /activities/{id}](./deleteactivity.md) - Delete an activity
- [GET /activities/{id}](./getactivity.md) - Get details of an activity
- [PUT /activities/{id}](./updateactivity.md) - Update an activity

### ActivityFields
[View all ActivityFields endpoints](./activityfields.md)

- [GET /activityFields](./getactivityfields.md) - Get all activity fields

### ActivityTypes
[View all ActivityTypes endpoints](./activitytypes.md)

- [DELETE /activityTypes](./deleteactivitytypes.md) - Delete multiple activity types in bulk
- [GET /activityTypes](./getactivitytypes.md) - Get all activity types
- [POST /activityTypes](./addactivitytype.md) - Add new activity type
- [DELETE /activityTypes/{id}](./deleteactivitytype.md) - Delete an activity type
- [PUT /activityTypes/{id}](./updateactivitytype.md) - Update an activity type

### Billing
[View all Billing endpoints](./billing.md)

- [GET /billing/subscriptions/addons](./getcompanyaddons.md) - Get all add-ons for a single company

### CallLogs
[View all CallLogs endpoints](./calllogs.md)

- [GET /callLogs](./getusercalllogs.md) - Get all call logs assigned to a particular user
- [POST /callLogs](./addcalllog.md) - Add a call log
- [DELETE /callLogs/{id}](./deletecalllog.md) - Delete a call log
- [GET /callLogs/{id}](./getcalllog.md) - Get details of a call log
- [POST /callLogs/{id}/recordings](./addcalllogaudiofile.md) - Attach an audio file to the call log

### Channels
[View all Channels endpoints](./channels.md)

- [POST /channels](./addchannel.md) - Add a channel
- [POST /channels/messages/receive](./receivemessage.md) - Receives an incoming message
- [DELETE /channels/{channel-id}/conversations/{conversation-id}](./deleteconversation.md) - Delete a conversation
- [DELETE /channels/{id}](./deletechannel.md) - Delete a channel

### Currencies
[View all Currencies endpoints](./currencies.md)

- [GET /currencies](./getcurrencies.md) - Get all supported currencies

### DealFields
[View all DealFields endpoints](./dealfields.md)

- [DELETE /dealFields](./deletedealfields.md) - Delete multiple deal fields in bulk
- [GET /dealFields](./getdealfields.md) - Get all deal fields
- [POST /dealFields](./adddealfield.md) - Add a new deal field
- [DELETE /dealFields/{id}](./deletedealfield.md) - Delete a deal field
- [GET /dealFields/{id}](./getdealfield.md) - Get one deal field
- [PUT /dealFields/{id}](./updatedealfield.md) - Update a deal field

### Deals
[View all Deals endpoints](./deals.md)

- [DELETE /deals](./deletedeals.md) - Delete multiple deals in bulk
- [GET /deals](./getdeals.md) - Get all deals
- [POST /deals](./adddeal.md) - Add a deal
- [GET /deals/archived](./getarchiveddeals.md) - Get all archived deals
- [GET /deals/collection](./getdealscollection.md) - Get all deals collection
- [GET /deals/search](./searchdeals.md) - Search deals
- [GET /deals/summary](./getdealssummary.md) - Get deals summary
- [GET /deals/summary/archived](./getarchiveddealssummary.md) - Get archived deals summary
- [GET /deals/timeline](./getdealstimeline.md) - Get deals timeline
- [GET /deals/timeline/archived](./getarchiveddealstimeline.md) - Get archived deals timeline
- [DELETE /deals/{id}](./deletedeal.md) - Delete a deal
- [GET /deals/{id}](./getdeal.md) - Get details of a deal
- [PUT /deals/{id}](./updatedeal.md) - Update a deal
- [GET /deals/{id}/activities](./getdealactivities.md) - List activities associated with a deal
- [GET /deals/{id}/changelog](./getdealchangelog.md) - List updates about deal field values
- [POST /deals/{id}/duplicate](./duplicatedeal.md) - Duplicate deal
- [GET /deals/{id}/files](./getdealfiles.md) - List files attached to a deal
- [GET /deals/{id}/flow](./getdealupdates.md) - List updates about a deal
- [GET /deals/{id}/followers](./getdealfollowers.md) - List followers of a deal
- [POST /deals/{id}/followers](./adddealfollower.md) - Add a follower to a deal
- [DELETE /deals/{id}/followers/{follower_id}](./deletedealfollower.md) - Delete a follower from a deal
- [GET /deals/{id}/mailMessages](./getdealmailmessages.md) - List mail messages associated with a deal
- [PUT /deals/{id}/merge](./mergedeals.md) - Merge two deals
- [GET /deals/{id}/participants](./getdealparticipants.md) - List participants of a deal
- [POST /deals/{id}/participants](./adddealparticipant.md) - Add a participant to a deal
- [DELETE /deals/{id}/participants/{deal_participant_id}](./deletedealparticipant.md) - Delete a participant from a deal
- [GET /deals/{id}/participantsChangelog](./getdealparticipantschangelog.md) - List updates about participants of a deal
- [GET /deals/{id}/permittedUsers](./getdealusers.md) - List permitted users
- [GET /deals/{id}/persons](./getdealpersons.md) - List all persons associated with a deal
- [GET /deals/{id}/products](./getdealproducts.md) - List products attached to a deal
- [POST /deals/{id}/products](./adddealproduct.md) - Add a product to a deal
- [DELETE /deals/{id}/products/{product_attachment_id}](./deletedealproduct.md) - Delete an attached product from a deal
- [PUT /deals/{id}/products/{product_attachment_id}](./updatedealproduct.md) - Update the product attached to a deal

### Files
[View all Files endpoints](./files.md)

- [GET /files](./getfiles.md) - Get all files
- [POST /files](./addfile.md) - Add file
- [POST /files/remote](./addfileandlinkit.md) - Create a remote file and link it to an item
- [POST /files/remoteLink](./linkfiletoitem.md) - Link a remote file to an item
- [DELETE /files/{id}](./deletefile.md) - Delete a file
- [GET /files/{id}](./getfile.md) - Get one file
- [PUT /files/{id}](./updatefile.md) - Update file details
- [GET /files/{id}/download](./downloadfile.md) - Download one file

### Filters
[View all Filters endpoints](./filters.md)

- [DELETE /filters](./deletefilters.md) - Delete multiple filters in bulk
- [GET /filters](./getfilters.md) - Get all filters
- [POST /filters](./addfilter.md) - Add a new filter
- [GET /filters/helpers](./getfilterhelpers.md) - Get all filter helpers
- [DELETE /filters/{id}](./deletefilter.md) - Delete a filter
- [GET /filters/{id}](./getfilter.md) - Get one filter
- [PUT /filters/{id}](./updatefilter.md) - Update filter

### Goals
[View all Goals endpoints](./goals.md)

- [POST /goals](./addgoal.md) - Add a new goal
- [GET /goals/find](./getgoals.md) - Find goals
- [DELETE /goals/{id}](./deletegoal.md) - Delete existing goal
- [PUT /goals/{id}](./updategoal.md) - Update existing goal
- [GET /goals/{id}/results](./getgoalresult.md) - Get result of a goal

### ItemSearch
[View all ItemSearch endpoints](./itemsearch.md)

- [GET /itemSearch](./searchitem.md) - Perform a search from multiple item types
- [GET /itemSearch/field](./searchitembyfield.md) - Perform a search using a specific field from an item type

### LeadLabels
[View all LeadLabels endpoints](./leadlabels.md)

- [GET /leadLabels](./getleadlabels.md) - Get all lead labels
- [POST /leadLabels](./addleadlabel.md) - Add a lead label
- [DELETE /leadLabels/{id}](./deleteleadlabel.md) - Delete a lead label
- [PATCH /leadLabels/{id}](./updateleadlabel.md) - Update a lead label

### LeadSources
[View all LeadSources endpoints](./leadsources.md)

- [GET /leadSources](./getleadsources.md) - Get all lead sources

### Leads
[View all Leads endpoints](./leads.md)

- [GET /leads](./getleads.md) - Get all leads
- [POST /leads](./addlead.md) - Add a lead
- [GET /leads/archived](./getarchivedleads.md) - Get all archived leads
- [GET /leads/search](./searchleads.md) - Search leads
- [DELETE /leads/{id}](./deletelead.md) - Delete a lead
- [GET /leads/{id}](./getlead.md) - Get one lead
- [PATCH /leads/{id}](./updatelead.md) - Update a lead
- [GET /leads/{id}/permittedUsers](./getleadusers.md) - List permitted users

### LegacyTeams
[View all LegacyTeams endpoints](./legacyteams.md)

- [GET /legacyTeams](./getteams.md) - Get all teams
- [POST /legacyTeams](./addteam.md) - Add a new team
- [GET /legacyTeams/user/{id}](./getuserteams.md) - Get all teams of a user
- [GET /legacyTeams/{id}](./getteam.md) - Get a single team
- [PUT /legacyTeams/{id}](./updateteam.md) - Update a team
- [DELETE /legacyTeams/{id}/users](./deleteteamuser.md) - Delete users from a team
- [GET /legacyTeams/{id}/users](./getteamusers.md) - Get all users in a team
- [POST /legacyTeams/{id}/users](./addteamuser.md) - Add users to a team

### Mailbox
[View all Mailbox endpoints](./mailbox.md)

- [GET /mailbox/mailMessages/{id}](./getmailmessage.md) - Get one mail message
- [GET /mailbox/mailThreads](./getmailthreads.md) - Get mail threads
- [DELETE /mailbox/mailThreads/{id}](./deletemailthread.md) - Delete mail thread
- [GET /mailbox/mailThreads/{id}](./getmailthread.md) - Get one mail thread
- [PUT /mailbox/mailThreads/{id}](./updatemailthreaddetails.md) - Update mail thread details
- [GET /mailbox/mailThreads/{id}/mailMessages](./getmailthreadmessages.md) - Get all mail messages of mail thread

### Meetings
[View all Meetings endpoints](./meetings.md)

- [POST /meetings/userProviderLinks](./saveuserproviderlink.md) - Link a user with the installed video call integration
- [DELETE /meetings/userProviderLinks/{id}](./deleteuserproviderlink.md) - Delete the link between a user and the installed video call integration

### NoteFields
[View all NoteFields endpoints](./notefields.md)

- [GET /noteFields](./getnotefields.md) - Get all note fields

### Notes
[View all Notes endpoints](./notes.md)

- [GET /notes](./getnotes.md) - Get all notes
- [POST /notes](./addnote.md) - Add a note
- [DELETE /notes/{id}](./deletenote.md) - Delete a note
- [GET /notes/{id}](./getnote.md) - Get one note
- [PUT /notes/{id}](./updatenote.md) - Update a note
- [GET /notes/{id}/comments](./getnotecomments.md) - Get all comments for a note
- [POST /notes/{id}/comments](./addnotecomment.md) - Add a comment to a note
- [DELETE /notes/{id}/comments/{commentId}](./deletecomment.md) - Delete a comment related to a note
- [GET /notes/{id}/comments/{commentId}](./getcomment.md) - Get one comment
- [PUT /notes/{id}/comments/{commentId}](./updatecommentfornote.md) - Update a comment related to a note

### Oauth
[View all Oauth endpoints](./oauth.md)

- [GET /oauth/authorize](./authorize.md) - Requesting authorization
- [POST /oauth/token](./get-tokens.md) - Getting the tokens
- [POST /oauth/token/](./refresh-tokens.md) - Refreshing the tokens

### OrganizationFields
[View all OrganizationFields endpoints](./organizationfields.md)

- [DELETE /organizationFields](./deleteorganizationfields.md) - Delete multiple organization fields in bulk
- [GET /organizationFields](./getorganizationfields.md) - Get all organization fields
- [POST /organizationFields](./addorganizationfield.md) - Add a new organization field
- [DELETE /organizationFields/{id}](./deleteorganizationfield.md) - Delete an organization field
- [GET /organizationFields/{id}](./getorganizationfield.md) - Get one organization field
- [PUT /organizationFields/{id}](./updateorganizationfield.md) - Update an organization field

### OrganizationRelationships
[View all OrganizationRelationships endpoints](./organizationrelationships.md)

- [GET /organizationRelationships](./getorganizationrelationships.md) - Get all relationships for organization
- [POST /organizationRelationships](./addorganizationrelationship.md) - Create an organization relationship
- [DELETE /organizationRelationships/{id}](./deleteorganizationrelationship.md) - Delete an organization relationship
- [GET /organizationRelationships/{id}](./getorganizationrelationship.md) - Get one organization relationship
- [PUT /organizationRelationships/{id}](./updateorganizationrelationship.md) - Update an organization relationship

### Organizations
[View all Organizations endpoints](./organizations.md)

- [DELETE /organizations](./deleteorganizations.md) - Delete multiple organizations in bulk
- [GET /organizations](./getorganizations.md) - Get all organizations
- [POST /organizations](./addorganization.md) - Add an organization
- [GET /organizations/collection](./getorganizationscollection.md) - Get all organizations collection
- [GET /organizations/search](./searchorganization.md) - Search organizations
- [DELETE /organizations/{id}](./deleteorganization.md) - Delete an organization
- [GET /organizations/{id}](./getorganization.md) - Get details of an organization
- [PUT /organizations/{id}](./updateorganization.md) - Update an organization
- [GET /organizations/{id}/activities](./getorganizationactivities.md) - List activities associated with an organization
- [GET /organizations/{id}/changelog](./getorganizationchangelog.md) - List updates about organization field values
- [GET /organizations/{id}/deals](./getorganizationdeals.md) - List deals associated with an organization
- [GET /organizations/{id}/files](./getorganizationfiles.md) - List files attached to an organization
- [GET /organizations/{id}/flow](./getorganizationupdates.md) - List updates about an organization
- [GET /organizations/{id}/followers](./getorganizationfollowers.md) - List followers of an organization
- [POST /organizations/{id}/followers](./addorganizationfollower.md) - Add a follower to an organization
- [DELETE /organizations/{id}/followers/{follower_id}](./deleteorganizationfollower.md) - Delete a follower from an organization
- [GET /organizations/{id}/mailMessages](./getorganizationmailmessages.md) - List mail messages associated with an organization
- [PUT /organizations/{id}/merge](./mergeorganizations.md) - Merge two organizations
- [GET /organizations/{id}/permittedUsers](./getorganizationusers.md) - List permitted users
- [GET /organizations/{id}/persons](./getorganizationpersons.md) - List persons of an organization

### PermissionSets
[View all PermissionSets endpoints](./permissionsets.md)

- [GET /permissionSets](./getpermissionsets.md) - Get all permission sets
- [GET /permissionSets/{id}](./getpermissionset.md) - Get one permission set
- [GET /permissionSets/{id}/assignments](./getpermissionsetassignments.md) - List permission set assignments

### PersonFields
[View all PersonFields endpoints](./personfields.md)

- [DELETE /personFields](./deletepersonfields.md) - Delete multiple person fields in bulk
- [GET /personFields](./getpersonfields.md) - Get all person fields
- [POST /personFields](./addpersonfield.md) - Add a new person field
- [DELETE /personFields/{id}](./deletepersonfield.md) - Delete a person field
- [GET /personFields/{id}](./getpersonfield.md) - Get one person field
- [PUT /personFields/{id}](./updatepersonfield.md) - Update a person field

### Persons
[View all Persons endpoints](./persons.md)

- [DELETE /persons](./deletepersons.md) - Delete multiple persons in bulk
- [GET /persons](./getpersons.md) - Get all persons
- [POST /persons](./addperson.md) - Add a person
- [GET /persons/collection](./getpersonscollection.md) - Get all persons collection
- [GET /persons/search](./searchpersons.md) - Search persons
- [DELETE /persons/{id}](./deleteperson.md) - Delete a person
- [GET /persons/{id}](./getperson.md) - Get details of a person
- [PUT /persons/{id}](./updateperson.md) - Update a person
- [GET /persons/{id}/activities](./getpersonactivities.md) - List activities associated with a person
- [GET /persons/{id}/changelog](./getpersonchangelog.md) - List updates about person field values
- [GET /persons/{id}/deals](./getpersondeals.md) - List deals associated with a person
- [GET /persons/{id}/files](./getpersonfiles.md) - List files attached to a person
- [GET /persons/{id}/flow](./getpersonupdates.md) - List updates about a person
- [GET /persons/{id}/followers](./getpersonfollowers.md) - List followers of a person
- [POST /persons/{id}/followers](./addpersonfollower.md) - Add a follower to a person
- [DELETE /persons/{id}/followers/{follower_id}](./deletepersonfollower.md) - Delete a follower from a person
- [GET /persons/{id}/mailMessages](./getpersonmailmessages.md) - List mail messages associated with a person
- [PUT /persons/{id}/merge](./mergepersons.md) - Merge two persons
- [GET /persons/{id}/permittedUsers](./getpersonusers.md) - List permitted users
- [DELETE /persons/{id}/picture](./deletepersonpicture.md) - Delete person picture
- [POST /persons/{id}/picture](./addpersonpicture.md) - Add person picture
- [GET /persons/{id}/products](./getpersonproducts.md) - List products associated with a person

### Pipelines
[View all Pipelines endpoints](./pipelines.md)

- [GET /pipelines](./getpipelines.md) - Get all pipelines
- [POST /pipelines](./addpipeline.md) - Add a new pipeline
- [DELETE /pipelines/{id}](./deletepipeline.md) - Delete a pipeline
- [GET /pipelines/{id}](./getpipeline.md) - Get one pipeline
- [PUT /pipelines/{id}](./updatepipeline.md) - Update a pipeline
- [GET /pipelines/{id}/conversion_statistics](./getpipelineconversionstatistics.md) - Get deals conversion rates in pipeline
- [GET /pipelines/{id}/deals](./getpipelinedeals.md) - Get deals in a pipeline
- [GET /pipelines/{id}/movement_statistics](./getpipelinemovementstatistics.md) - Get deals movements in pipeline

### ProductFields
[View all ProductFields endpoints](./productfields.md)

- [DELETE /productFields](./deleteproductfields.md) - Delete multiple product fields in bulk
- [GET /productFields](./getproductfields.md) - Get all product fields
- [POST /productFields](./addproductfield.md) - Add a new product field
- [DELETE /productFields/{id}](./deleteproductfield.md) - Delete a product field
- [GET /productFields/{id}](./getproductfield.md) - Get one product field
- [PUT /productFields/{id}](./updateproductfield.md) - Update a product field

### Products
[View all Products endpoints](./products.md)

- [GET /products](./getproducts.md) - Get all products
- [POST /products](./addproduct.md) - Add a product
- [GET /products/search](./searchproducts.md) - Search products
- [DELETE /products/{id}](./deleteproduct.md) - Delete a product
- [GET /products/{id}](./getproduct.md) - Get one product
- [PUT /products/{id}](./updateproduct.md) - Update a product
- [GET /products/{id}/deals](./getproductdeals.md) - Get deals where a product is attached to
- [GET /products/{id}/files](./getproductfiles.md) - List files attached to a product
- [GET /products/{id}/followers](./getproductfollowers.md) - List followers of a product
- [POST /products/{id}/followers](./addproductfollower.md) - Add a follower to a product
- [DELETE /products/{id}/followers/{follower_id}](./deleteproductfollower.md) - Delete a follower from a product
- [GET /products/{id}/permittedUsers](./getproductusers.md) - List permitted users

### ProjectTemplates
[View all ProjectTemplates endpoints](./projecttemplates.md)

- [GET /projectTemplates](./getprojecttemplates.md) - Get all project templates
- [GET /projectTemplates/{id}](./getprojecttemplate.md) - Get details of a template
- [GET /projects/boards/{id}](./getprojectsboard.md) - Get details of a board
- [GET /projects/phases/{id}](./getprojectsphase.md) - Get details of a phase

### Projects
[View all Projects endpoints](./projects.md)

- [GET /projects](./getprojects.md) - Get all projects
- [POST /projects](./addproject.md) - Add a project
- [GET /projects/boards](./getprojectsboards.md) - Get all project boards
- [GET /projects/phases](./getprojectsphases.md) - Get project phases
- [DELETE /projects/{id}](./deleteproject.md) - Delete a project
- [GET /projects/{id}](./getproject.md) - Get details of a project
- [PUT /projects/{id}](./updateproject.md) - Update a project
- [GET /projects/{id}/activities](./getprojectactivities.md) - Returns project activities
- [POST /projects/{id}/archive](./archiveproject.md) - Archive a project
- [GET /projects/{id}/groups](./getprojectgroups.md) - Returns project groups
- [GET /projects/{id}/plan](./getprojectplan.md) - Returns project plan
- [PUT /projects/{id}/plan/activities/{activityId}](./putprojectplanactivity.md) - Update activity in project plan
- [PUT /projects/{id}/plan/tasks/{taskId}](./putprojectplantask.md) - Update task in project plan
- [GET /projects/{id}/tasks](./getprojecttasks.md) - Returns project tasks

### Recents
[View all Recents endpoints](./recents.md)

- [GET /recents](./getrecents.md) - Get recents

### Roles
[View all Roles endpoints](./roles.md)

- [GET /roles](./getroles.md) - Get all roles
- [POST /roles](./addrole.md) - Add a role
- [DELETE /roles/{id}](./deleterole.md) - Delete a role
- [GET /roles/{id}](./getrole.md) - Get one role
- [PUT /roles/{id}](./updaterole.md) - Update role details
- [DELETE /roles/{id}/assignments](./deleteroleassignment.md) - Delete a role assignment
- [GET /roles/{id}/assignments](./getroleassignments.md) - List role assignments
- [POST /roles/{id}/assignments](./addroleassignment.md) - Add role assignment
- [GET /roles/{id}/pipelines](./getrolepipelines.md) - List pipeline visibility for a role
- [PUT /roles/{id}/pipelines](./updaterolepipelines.md) - Update pipeline visibility for a role
- [GET /roles/{id}/settings](./getrolesettings.md) - List role settings
- [POST /roles/{id}/settings](./addorupdaterolesetting.md) - Add or update role setting

### Stages
[View all Stages endpoints](./stages.md)

- [DELETE /stages](./deletestages.md) - Delete multiple stages in bulk
- [GET /stages](./getstages.md) - Get all stages
- [POST /stages](./addstage.md) - Add a new stage
- [DELETE /stages/{id}](./deletestage.md) - Delete a stage
- [GET /stages/{id}](./getstage.md) - Get one stage
- [PUT /stages/{id}](./updatestage.md) - Update stage details
- [GET /stages/{id}/deals](./getstagedeals.md) - Get deals in a stage

### Tasks
[View all Tasks endpoints](./tasks.md)

- [GET /tasks](./gettasks.md) - Get all tasks
- [POST /tasks](./addtask.md) - Add a task
- [DELETE /tasks/{id}](./deletetask.md) - Delete a task
- [GET /tasks/{id}](./gettask.md) - Get details of a task
- [PUT /tasks/{id}](./updatetask.md) - Update a task

### UserConnections
[View all UserConnections endpoints](./userconnections.md)

- [GET /userConnections](./getuserconnections.md) - Get all user connections

### UserSettings
[View all UserSettings endpoints](./usersettings.md)

- [GET /userSettings](./getusersettings.md) - List settings of an authorized user

### Users
[View all Users endpoints](./users.md)

- [GET /users](./getusers.md) - Get all users
- [POST /users](./adduser.md) - Add a new user
- [GET /users/find](./findusersbyname.md) - Find users by name
- [GET /users/me](./getcurrentuser.md) - Get current user data
- [GET /users/{id}](./getuser.md) - Get one user
- [PUT /users/{id}](./updateuser.md) - Update user details
- [GET /users/{id}/followers](./getuserfollowers.md) - List followers of a user
- [GET /users/{id}/permissions](./getuserpermissions.md) - List user permissions
- [GET /users/{id}/roleAssignments](./getuserroleassignments.md) - List role assignments
- [GET /users/{id}/roleSettings](./getuserrolesettings.md) - List user role settings

### Webhooks
[View all Webhooks endpoints](./webhooks.md)

- [GET /webhooks](./getwebhooks.md) - Get all Webhooks
- [POST /webhooks](./addwebhook.md) - Create a new Webhook
- [DELETE /webhooks/{id}](./deletewebhook.md) - Delete existing Webhook
