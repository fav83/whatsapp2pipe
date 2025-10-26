# Deals API Endpoints

This document contains all API endpoints related to **Deals**.

## Endpoints

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