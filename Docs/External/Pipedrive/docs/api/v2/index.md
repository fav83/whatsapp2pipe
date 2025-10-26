# Pipedrive API v2

**Version:** 2.0.0
**OpenAPI Version:** 3.0.1

## API Endpoints by Category

### Activities
[View all Activities endpoints](./activities.md)

- [GET /activities](./getactivities.md) - Get all activities
- [POST /activities](./addactivity.md) - Add a new activity
- [DELETE /activities/{id}](./deleteactivity.md) - Delete an activity
- [GET /activities/{id}](./getactivity.md) - Get details of an activity
- [PATCH /activities/{id}](./updateactivity.md) - Update an activity

### Deals
[View all Deals endpoints](./deals.md)

- [GET /deals](./getdeals.md) - Get all deals
- [POST /deals](./adddeal.md) - Add a new deal
- [GET /deals/archived](./getarchiveddeals.md) - Get all archived deals
- [GET /deals/installments](./getinstallments.md) - List installments added to a list of deals
- [GET /deals/products](./getdealsproducts.md) - Get deal products of several deals
- [GET /deals/search](./searchdeals.md) - Search deals
- [DELETE /deals/{id}](./deletedeal.md) - Delete a deal
- [GET /deals/{id}](./getdeal.md) - Get details of a deal
- [PATCH /deals/{id}](./updatedeal.md) - Update a deal
- [POST /deals/{id}/convert/lead](./convertdealtolead.md) - Convert a deal to a lead (BETA)
- [GET /deals/{id}/convert/status/{conversion_id}](./getdealconversionstatus.md) - Get Deal conversion status (BETA)
- [GET /deals/{id}/discounts](./getadditionaldiscounts.md) - List discounts added to a deal
- [POST /deals/{id}/discounts](./postadditionaldiscount.md) - Add a discount to a deal
- [DELETE /deals/{id}/discounts/{discount_id}](./deleteadditionaldiscount.md) - Delete a discount from a deal
- [PATCH /deals/{id}/discounts/{discount_id}](./updateadditionaldiscount.md) - Update a discount added to a deal
- [GET /deals/{id}/followers](./getdealfollowers.md) - List followers of a deal
- [POST /deals/{id}/followers](./adddealfollower.md) - Add a follower to a deal
- [GET /deals/{id}/followers/changelog](./getdealfollowerschangelog.md) - List followers changelog of a deal
- [DELETE /deals/{id}/followers/{follower_id}](./deletedealfollower.md) - Delete a follower from a deal
- [POST /deals/{id}/installments](./postinstallment.md) - Add an installment to a deal
- [DELETE /deals/{id}/installments/{installment_id}](./deleteinstallment.md) - Delete an installment from a deal
- [PATCH /deals/{id}/installments/{installment_id}](./updateinstallment.md) - Update an installment added to a deal
- [DELETE /deals/{id}/products](./deletemanydealproducts.md) - Delete many products from a deal
- [GET /deals/{id}/products](./getdealproducts.md) - List products attached to a deal
- [POST /deals/{id}/products](./adddealproduct.md) - Add a product to a deal
- [POST /deals/{id}/products/bulk](./addmanydealproducts.md) - Add multiple products to a deal
- [DELETE /deals/{id}/products/{product_attachment_id}](./deletedealproduct.md) - Delete an attached product from a deal
- [PATCH /deals/{id}/products/{product_attachment_id}](./updatedealproduct.md) - Update the product attached to a deal

### ItemSearch
[View all ItemSearch endpoints](./itemsearch.md)

- [GET /itemSearch](./searchitem.md) - Perform a search from multiple item types
- [GET /itemSearch/field](./searchitembyfield.md) - Perform a search using a specific field from an item type

### Leads
[View all Leads endpoints](./leads.md)

- [GET /leads/search](./searchleads.md) - Search leads
- [POST /leads/{id}/convert/deal](./convertleadtodeal.md) - Convert a lead to a deal (BETA)
- [GET /leads/{id}/convert/status/{conversion_id}](./getleadconversionstatus.md) - Get Lead conversion status (BETA)

### Organizations
[View all Organizations endpoints](./organizations.md)

- [GET /organizations](./getorganizations.md) - Get all organizations
- [POST /organizations](./addorganization.md) - Add a new organization
- [GET /organizations/search](./searchorganization.md) - Search organizations
- [DELETE /organizations/{id}](./deleteorganization.md) - Delete a organization
- [GET /organizations/{id}](./getorganization.md) - Get details of a organization
- [PATCH /organizations/{id}](./updateorganization.md) - Update a organization
- [GET /organizations/{id}/followers](./getorganizationfollowers.md) - List followers of an organization
- [POST /organizations/{id}/followers](./addorganizationfollower.md) - Add a follower to an organization
- [GET /organizations/{id}/followers/changelog](./getorganizationfollowerschangelog.md) - List followers changelog of an organization
- [DELETE /organizations/{id}/followers/{follower_id}](./deleteorganizationfollower.md) - Delete a follower from an organization

### Persons
[View all Persons endpoints](./persons.md)

- [GET /persons](./getpersons.md) - Get all persons
- [POST /persons](./addperson.md) - Add a new person
- [GET /persons/search](./searchpersons.md) - Search persons
- [DELETE /persons/{id}](./deleteperson.md) - Delete a person
- [GET /persons/{id}](./getperson.md) - Get details of a person
- [PATCH /persons/{id}](./updateperson.md) - Update a person
- [GET /persons/{id}/followers](./getpersonfollowers.md) - List followers of a person
- [POST /persons/{id}/followers](./addpersonfollower.md) - Add a follower to a person
- [GET /persons/{id}/followers/changelog](./getpersonfollowerschangelog.md) - List followers changelog of a person
- [DELETE /persons/{id}/followers/{follower_id}](./deletepersonfollower.md) - Delete a follower from a person

### Pipelines
[View all Pipelines endpoints](./pipelines.md)

- [GET /pipelines](./getpipelines.md) - Get all pipelines
- [POST /pipelines](./addpipeline.md) - Add a new pipeline
- [DELETE /pipelines/{id}](./deletepipeline.md) - Delete a pipeline
- [GET /pipelines/{id}](./getpipeline.md) - Get one pipeline
- [PATCH /pipelines/{id}](./updatepipeline.md) - Update a pipeline

### Products
[View all Products endpoints](./products.md)

- [GET /products](./getproducts.md) - Get all products
- [POST /products](./addproduct.md) - Add a product
- [GET /products/search](./searchproducts.md) - Search products
- [DELETE /products/{id}](./deleteproduct.md) - Delete a product
- [GET /products/{id}](./getproduct.md) - Get one product
- [PATCH /products/{id}](./updateproduct.md) - Update a product
- [GET /products/{id}/followers](./getproductfollowers.md) - List followers of a product
- [POST /products/{id}/followers](./addproductfollower.md) - Add a follower to a product
- [GET /products/{id}/followers/changelog](./getproductfollowerschangelog.md) - List followers changelog of a product
- [DELETE /products/{id}/followers/{follower_id}](./deleteproductfollower.md) - Delete a follower from a product
- [DELETE /products/{id}/images](./deleteproductimage.md) - Delete an image of a product
- [GET /products/{id}/images](./getproductimage.md) - Get image of a product
- [POST /products/{id}/images](./uploadproductimage.md) - Upload an image for a product
- [PUT /products/{id}/images](./updateproductimage.md) - Update an image for a product
- [GET /products/{id}/variations](./getproductvariations.md) - Get all product variations
- [POST /products/{id}/variations](./addproductvariation.md) - Add a product variation
- [DELETE /products/{id}/variations/{product_variation_id}](./deleteproductvariation.md) - Delete a product variation
- [PATCH /products/{id}/variations/{product_variation_id}](./updateproductvariation.md) - Update a product variation

### Stages
[View all Stages endpoints](./stages.md)

- [GET /stages](./getstages.md) - Get all stages
- [POST /stages](./addstage.md) - Add a new stage
- [DELETE /stages/{id}](./deletestage.md) - Delete a stage
- [GET /stages/{id}](./getstage.md) - Get one stage
- [PATCH /stages/{id}](./updatestage.md) - Update stage details

### Users
[View all Users endpoints](./users.md)

- [GET /users/{id}/followers](./getuserfollowers.md) - List followers of a user
