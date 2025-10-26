# Deals API Endpoints

This document contains all API endpoints related to **Deals**.

## Endpoints

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