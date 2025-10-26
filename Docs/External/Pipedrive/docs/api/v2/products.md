# Products API Endpoints

This document contains all API endpoints related to **Products**.

## Endpoints

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