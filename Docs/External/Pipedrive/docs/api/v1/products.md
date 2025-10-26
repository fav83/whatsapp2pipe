# Products API Endpoints

This document contains all API endpoints related to **Products**.

## Endpoints

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