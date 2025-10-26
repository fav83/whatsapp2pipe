# Using Pipedrive Documentation with Claude Code

This directory contains the complete Pipedrive API documentation scraped from pipedrive.readme.io and converted to markdown format.

## What's Included

The scraper successfully downloaded **81 documentation pages** covering:

- Getting Started & Tutorials
- API Core Concepts (authentication, pagination, rate limiting, etc.)
- Marketplace & App Development
- OAuth Authorization
- App Extensions (panels, modals, actions, custom UI)
- Webhooks
- API v2 Migration Guides
- Best Practices & Optimization

## Directory Structure

```
Playground/pipedrive-dev-docs/
├── docs/                          # 81 markdown files with Pipedrive documentation
│   ├── index.md                  # Main getting started page
│   ├── core-api-concepts-*.md    # API fundamentals
│   ├── marketplace-*.md          # Marketplace and OAuth docs
│   ├── app-extensions-*.md       # App extension documentation
│   └── ... (78 more files)
├── scrape_pipedrive_docs.py      # Python scraper script
├── requirements.txt              # Python dependencies
├── README.md                     # Scraper documentation
└── USAGE_WITH_CLAUDE.md          # This file
```

## How to Use with Claude Code

### 1. Referencing Documentation in Prompts

You can now reference Pipedrive documentation directly in your Claude Code conversations:

```
"According to docs/core-api-concepts-authentication.md, what's the best
way to authenticate my app?"

"Show me how to implement OAuth as described in
docs/marketplace-oauth-authorization.md"

"Based on docs/webhooks-for-apps.md, help me set up webhooks
for deal updates"
```

### 2. Reading Documentation Files

Claude Code can read these markdown files directly:

```
"Read docs/app-extensions-panels.md and help me create a JSON panel
for displaying WhatsApp contacts"

"Compare the authentication methods in docs/core-api-concepts-authentication.md
and recommend which one to use for my Chrome extension"
```

### 3. Cross-References

All links between documentation pages have been converted to relative markdown links, so you can follow references naturally:

- Links like `[Authentication](./core-api-concepts-authentication.md)` work correctly
- Claude can follow these references to understand related concepts
- The documentation maintains its original structure and relationships

### 4. Finding Specific Information

Use Claude Code to search across the documentation:

```
"Search the docs/ folder for information about rate limiting"

"Find all mentions of 'custom fields' in the documentation"

"What does the documentation say about pagination?"
```

## Key Documentation Files

Here are some important files you'll frequently reference:

### Getting Started
- `docs/index.md` - Main entry point
- `docs/hello-world-tutorial.md` - First app tutorial
- `docs/developer-sandbox-account.md` - Testing environment

### API Fundamentals
- `docs/core-api-concepts-about-pipedrive-api.md` - API overview
- `docs/core-api-concepts-authentication.md` - Authentication methods
- `docs/core-api-concepts-rate-limiting.md` - Rate limits
- `docs/core-api-concepts-pagination.md` - Pagination
- `docs/core-api-concepts-custom-fields.md` - Custom fields

### OAuth & Marketplace
- `docs/marketplace-oauth-authorization.md` - OAuth flow
- `docs/marketplace-creating-a-proper-app.md` - App creation
- `docs/marketplace-scopes-and-permissions-explanations.md` - Permissions

### App Extensions
- `docs/app-extensions.md` - Overview
- `docs/app-extensions-panels.md` - JSON panels
- `docs/app-extensions-actions.md` - Link actions
- `docs/custom-ui-extensions.md` - Custom UI with iframes

### Webhooks
- `docs/webhooks-for-apps.md` - Webhooks for apps
- `docs/guide-for-webhooks-v2.md` - Webhooks v2 guide
- `docs/list-of-webhooks-v2.md` - Available webhook events

### Practical Examples
- `docs/creating-a-deal.md` - Create deals
- `docs/adding-an-organization.md` - Create organizations
- `docs/adding-a-file.md` - Upload files
- `docs/working-with-labels.md` - Using labels

## Updating the Documentation

To refresh the documentation if Pipedrive updates it:

```bash
# From the Playground/pipedrive-dev-docs/ directory
python scrape_pipedrive_docs.py
```

This will:
1. Re-download all pages
2. Update cross-references
3. Overwrite existing files with fresh content

## Example: Building a Pipedrive Integration

Here's how you might use this documentation with Claude Code:

```
User: "I want to build a Chrome extension that syncs WhatsApp contacts
      to Pipedrive. Help me understand what I need from the Pipedrive API."

Claude: "Let me check the Pipedrive documentation..."
        [Reads docs/core-api-concepts-authentication.md]
        [Reads docs/marketplace-oauth-authorization.md]
        [Reads docs/creating-a-deal.md]

        "Based on the documentation, here's what you'll need:

        1. Authentication: You'll need OAuth 2.0 since you're building
           a Chrome extension (see docs/marketplace-oauth-authorization.md)

        2. Required scopes:
           - deals:full (to create/update deals)
           - contacts:full (to manage contacts)
           (from docs/marketplace-scopes-and-permissions-explanations.md)

        3. API endpoints you'll use:
           - POST /persons (add contacts)
           - POST /deals (create deals)
           - POST /files (attach files)

        Would you like me to help implement the OAuth flow first?"
```

## Tips for Working with This Documentation

1. **Start with index.md** - It provides a good overview of all available features

2. **Follow the tutorials** - The tutorial files provide working code examples

3. **Check API concepts first** - Understanding authentication, rate limiting, and pagination will save time later

4. **Reference cross-links** - When a doc references another, Claude can follow those links automatically

5. **Use grep/search** - Since all docs are in markdown, you can search across them efficiently

## Notes

- Documentation was scraped on: 2025-10-26
- Total pages: 81
- All pages include cross-references to related documentation
- Some pages may reference external resources (like Postman collections) which aren't included
- Images from the original docs are referenced but not downloaded
