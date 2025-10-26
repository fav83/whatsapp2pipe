# Tutorials Documentation Note

## Summary

The Pipedrive tutorials at https://developers.pipedrive.com/tutorials **have already been captured** in the main developer guides scrape.

## Why docs/tutorials/ Contains 404 Pages

The `scrape_tutorials.py` script attempted to scrape tutorials from https://developers.pipedrive.com/tutorials, but the individual tutorial pages returned 404 errors. This happened because:

1. The tutorials listing page (https://developers.pipedrive.com/tutorials) displays 25 tutorial cards
2. These cards use client-side routing (Next.js) and buttons instead of direct links
3. The actual tutorial content is hosted elsewhere and was already captured

## Where to Find Tutorial Content

**All tutorial content is already available** in the main `docs/` folder from the readme.io scrape:

### Tutorial Index
- **File:** `docs/tutorials.md`
- **Contains:** Complete list of tutorials organized by category with links

### Sample Tutorials Already Captured
- `docs/adding-a-file.md` - Adding a File via Pipedrive API
- `docs/adding-a-lead.md` - Adding a Lead via Pipedrive API
- `docs/adding-a-product.md` - Adding a Product
- `docs/adding-an-activity.md` - Adding an activity
- `docs/adding-an-organization.md` - Adding an Organization
- `docs/creating-a-deal.md` - How to create a deal
- `docs/updating-a-deal.md` - Updating a Deal
- `docs/updating-a-person.md` - Updating a Person
- `docs/getting-all-deals.md` - Getting all Deals
- `docs/using-pagination-to-retrieve-all-deal-titles.md` - Pagination
- `docs/merging-two-persons-in-pipedrive-via-pipedrive-api.md` - Merging Persons
- And many more...

## Tutorial Categories Available

From `docs/tutorials.md`, the following tutorial categories are available:

1. **Getting started** - API token, enabling API, company domain, Postman/Insomnia
2. **Activity** - Add an Activity
3. **Custom fields** - Add, Update, Delete custom fields
4. **Deals** - Get, Create, Update, Assign, Merge deals, Pagination
5. **Files** - Add files, Add remote files
6. **Filters** - Add a Filter
7. **Labels** - Working with labels
8. **Leads** - Adding a Lead
9. **Organizations** - Add, Merge organizations
10. **Person** - Merge, Update persons
11. **Product** - Add a Product
12. **Search** - New Search API migration guide

## Recommendation

**Delete the `docs/tutorials/` folder** - it only contains 404 error pages and provides no value. All tutorial content is already in the main `docs/` folder.

## Complete Documentation Inventory

You have successfully captured:

✅ **81 developer guides** (including tutorials) in `docs/`
✅ **274 API v1 endpoints** in `docs/api/v1/`
✅ **87 API v2 endpoints** in `docs/api/v2/`
✅ **2 OpenAPI specs** in `docs/api/`

**Total: 444 useful documentation files**

The tutorials were not missing - they were already captured through the readme.io scraper!
