# Pipedrive API Reference Documentation

This directory contains the complete Pipedrive API reference documentation generated from OpenAPI specifications.

## What's Included

### API Documentation (Generated from OpenAPI Specs)

The OpenAPI specifications were downloaded and converted to **414 markdown files**:

**API v1** (274 endpoints):
- 41 resource categories (Activities, Deals, Persons, Organizations, etc.)
- Complete endpoint documentation with parameters, request/response schemas
- Security requirements and OAuth scopes

**API v2** (87 endpoints):
- 10 resource categories
- Latest API version with updated endpoints
- Improved schemas and better performance

### Source Files

- `docs/api/openapi-v1.yaml` - OpenAPI 3.0.1 specification for API v1 (2.6MB)
- `docs/api/openapi-v2.yaml` - OpenAPI 3.0.1 specification for API v2 (511KB)

## Directory Structure

```
Playground/pipedrive-dev-docs/
├── docs/
│   ├── *.md                         # 81 developer guide pages
│   └── api/
│       ├── openapi-v1.yaml          # API v1 specification (source)
│       ├── openapi-v2.yaml          # API v2 specification (source)
│       ├── v1/
│       │   ├── index.md            # API v1 overview and endpoint index
│       │   ├── activities.md       # Activities category overview
│       │   ├── deals.md            # Deals category overview
│       │   ├── addactivity.md      # POST /activities endpoint
│       │   ├── adddeal.md          # POST /deals endpoint
│       │   └── ... (274 total endpoints)
│       └── v2/
│           ├── index.md            # API v2 overview and endpoint index
│           ├── activities.md       # Activities category overview (v2)
│           ├── deals.md            # Deals category overview (v2)
│           └── ... (87 total endpoints)
├── scrape_pipedrive_docs.py        # Developer guides scraper
├── convert_openapi_to_md.py        # OpenAPI to markdown converter
├── requirements.txt                # Python dependencies
└── README.md                       # Scraper documentation
```

## How to Use with Claude Code

### 1. Browse Available Endpoints

Start with the index files to see all available endpoints:

```
"Show me the API v1 endpoint index at docs/api/v1/index.md"

"What endpoints are available for Deals in API v2? Check docs/api/v2/deals.md"
```

### 2. Read Specific Endpoint Documentation

Each endpoint has its own markdown file with complete details:

```
"Read docs/api/v1/adddeal.md and show me how to create a deal"

"What parameters does the GET /persons endpoint accept?
 Check docs/api/v1/getpersons.md"

"Show me the response schema for adding an organization from
 docs/api/v1/addorganization.md"
```

### 3. Compare v1 vs v2 Endpoints

Since both versions are documented, you can compare them:

```
"Compare the differences between:
 - docs/api/v1/adddeal.md
 - docs/api/v2/adddeal.md"

"Which version should I use for creating deals? Compare the schemas."
```

### 4. Find Endpoints by Resource Type

Use the category overview files:

```
"Show me all person-related endpoints from docs/api/v1/persons.md"

"What operations can I perform on activities? Check docs/api/v1/activities.md"
```

### 5. Search Across API Documentation

```
"Search docs/api/ for endpoints that accept 'custom_fields'"

"Find all endpoints in docs/api/v1/ that require 'deals:full' scope"

"Which endpoints support bulk operations? Search docs/api/"
```

## Key API v1 Categories

### Core Resources (docs/api/v1/)
- **activities.md** - 7 endpoints - Manage activities and tasks
- **deals.md** - 33 endpoints - Complete deal lifecycle management
- **persons.md** - 22 endpoints - Contact/person management
- **organizations.md** - 20 endpoints - Company/organization management
- **products.md** - 12 endpoints - Product catalog management

### Custom Fields (docs/api/v1/)
- **dealfields.md** - 6 endpoints - Custom fields for deals
- **personfields.md** - 6 endpoints - Custom fields for persons
- **organizationfields.md** - 6 endpoints - Custom fields for organizations
- **productfields.md** - 6 endpoints - Custom fields for products

### Pipelines & Stages (docs/api/v1/)
- **pipelines.md** - 8 endpoints - Sales pipeline management
- **stages.md** - 7 endpoints - Deal stage configuration

### Communication (docs/api/v1/)
- **notes.md** - 10 endpoints - Notes and comments
- **files.md** - 8 endpoints - File attachments
- **calllogs.md** - 5 endpoints - Call logging
- **mailbox.md** - 6 endpoints - Email integration

### Search & Filtering (docs/api/v1/)
- **itemsearch.md** - 2 endpoints - Universal search
- **filters.md** - 7 endpoints - Saved filters

### Administration (docs/api/v1/)
- **users.md** - 10 endpoints - User management
- **roles.md** - 12 endpoints - Role-based permissions
- **permissionsets.md** - 3 endpoints - Permission management

### Integration (docs/api/v1/)
- **webhooks.md** - 3 endpoints - Webhook configuration
- **oauth.md** - 3 endpoints - OAuth token management

## Key API v2 Improvements

API v2 focuses on the most commonly used resources with improved schemas:

### Available in v2 (docs/api/v2/)
- **deals.md** - 28 endpoints - Enhanced deal management
- **persons.md** - 10 endpoints - Improved person schema
- **organizations.md** - 10 endpoints - Better organization data
- **activities.md** - 5 endpoints - Streamlined activities
- **products.md** - 18 endpoints - Enhanced product catalog
- **leads.md** - 3 endpoints - Lead management
- **pipelines.md** - 5 endpoints - Pipeline configuration
- **stages.md** - 5 endpoints - Stage management
- **itemsearch.md** - 2 endpoints - Search functionality
- **users.md** - 1 endpoint - User info

## Endpoint Documentation Format

Each endpoint file includes:

### 1. Endpoint Overview
```markdown
# POST /deals

> **Operation ID:** `addDeal`
> **Tags:** `Deals`

## Add a deal
```

### 2. Parameters Table
Lists all query parameters, path parameters, and headers:
- Name, type, location (query/path/header)
- Required/optional status
- Description and allowed values

### 3. Request Body Schema
Complete request body structure with:
- Field names and types
- Required vs optional fields
- Nested object structures
- Enum values where applicable

### 4. Response Schemas
For each status code (200, 201, 400, etc.):
- Response structure
- Field descriptions
- Nested objects and arrays

### 5. Security Requirements
OAuth scopes or API key requirements:
```markdown
## Security

- **api_key**
- **oauth2**: deals:full
```

## Regenerating Documentation

### Update API Reference

To get the latest API specifications:

```bash
# Download latest OpenAPI specs
curl -o docs/api/openapi-v1.yaml https://developers.pipedrive.com/docs/api/v1/openapi.yaml
curl -o docs/api/openapi-v2.yaml https://developers.pipedrive.com/docs/api/v1/openapi-v2.yaml

# Regenerate markdown documentation
python convert_openapi_to_md.py
```

### Update Developer Guides

To refresh the developer documentation:

```bash
# Re-scrape pipedrive.readme.io
python scrape_pipedrive_docs.py
```

## Integration Example

Here's how you might use this API documentation for building a WhatsApp-to-Pipedrive integration:

### Step 1: Understand Authentication

```
User: "How do I authenticate API requests?"

Claude: [Reads docs/core-api-concepts-authentication.md and docs/api/v1/oauth.md]
        "You have two options..."
```

### Step 2: Find Relevant Endpoints

```
User: "What endpoints do I need to create a person and attach them to a deal?"

Claude: [Reads docs/api/v1/index.md]
        [Reads docs/api/v1/persons.md and docs/api/v1/deals.md]
        "You'll need these endpoints:
        1. POST /persons (docs/api/v1/addperson.md)
        2. POST /deals (docs/api/v1/adddeal.md)

        Let me show you the schemas..."
        [Reads docs/api/v1/addperson.md]
        [Reads docs/api/v1/adddeal.md]
```

### Step 3: Understand Request/Response Formats

```
User: "Show me exactly what to send when creating a person"

Claude: [Reads docs/api/v1/addperson.md]
        "Based on the API reference, here's the request body schema:

        - name (required) - string
        - phone (optional) - array of phone objects
        - email (optional) - array of email objects
        - org_id (optional) - integer
        ..."
```

### Step 4: Check OAuth Scopes

```
User: "What OAuth scopes do I need for this integration?"

Claude: [Searches docs/api/v1/ for security requirements]
        "Based on the endpoint documentation:

        - deals:full (for creating/updating deals)
        - contacts:full (for person management)

        See docs/marketplace-scopes-and-permissions-explanations.md
        for complete scope descriptions."
```

## Tips for Working with API Reference

1. **Start with the index** - `docs/api/v1/index.md` or `docs/api/v2/index.md` provide complete endpoint lists

2. **Use category overviews** - Files like `deals.md`, `persons.md` group related endpoints

3. **Check both versions** - Some endpoints are only in v1, others have improvements in v2

4. **Read the developer guides** - The `docs/*.md` files provide context that complements the API reference

5. **Reference OpenAPI specs directly** - For programmatic access, use the YAML files with OpenAPI tools

6. **Search for operation IDs** - Each endpoint has a unique operation ID (e.g., `addDeal`, `getPerson`)

7. **Look for security sections** - Every endpoint documents required scopes and authentication

## Combined Documentation

You now have both:

1. **Developer Guides** (81 files in `docs/`)
   - Concepts, tutorials, best practices
   - OAuth setup, webhooks, extensions
   - Migration guides and FAQs

2. **API Reference** (414 files in `docs/api/`)
   - Every endpoint with full schemas
   - Request/response examples
   - Parameter descriptions
   - Security requirements

Use them together for complete Pipedrive integration knowledge!

## Notes

- API documentation generated from OpenAPI specs on: 2025-10-26
- OpenAPI version: 3.0.1
- Total endpoints documented: 361 (274 v1 + 87 v2)
- Total markdown files: 495 (81 guides + 414 API reference)
- All documentation is searchable and cross-referenced
