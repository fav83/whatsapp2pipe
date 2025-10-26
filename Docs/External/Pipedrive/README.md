# Pipedrive Documentation Tools

This repository contains Python scripts to download and convert **all Pipedrive documentation** to markdown files for use with Claude Code and other AI assistants.

## What's Included

1. **Developer Guides Scraper** (`scrape_pipedrive_docs.py`)
   - Downloads 81 pages from [pipedrive.readme.io](https://pipedrive.readme.io)
   - Covers tutorials, OAuth, webhooks, app extensions, best practices

2. **API Reference Converter** (`convert_openapi_to_md.py`)
   - Downloads OpenAPI specifications from developers.pipedrive.com
   - Generates 414 markdown files for 361 API endpoints (v1 + v2)
   - Complete parameter, request, and response documentation

**Total:** 495 markdown files with complete Pipedrive documentation!

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Download developer guides (81 pages)
python scrape_pipedrive_docs.py

# Download API specifications and generate reference docs (361 endpoints)
curl -o docs/api/openapi-v1.yaml https://developers.pipedrive.com/docs/api/v1/openapi.yaml
curl -o docs/api/openapi-v2.yaml https://developers.pipedrive.com/docs/api/v1/openapi-v2.yaml
python convert_openapi_to_md.py
```

## Features

### Developer Guides Scraper
- Crawls all documentation pages starting from the Getting Started page
- Converts HTML content to clean markdown format
- Maintains cross-references between documents using relative links
- Respects rate limiting with delays between requests
- Generates an index file listing all downloaded pages
- Saves output to `docs/` directory

### API Reference Converter
- Downloads OpenAPI 3.0.1 specifications
- Converts to organized markdown documentation
- One file per endpoint with complete details
- Category overview files for easy navigation
- Includes parameters, request/response schemas, security requirements

## Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

## Installation

1. Install required dependencies:

```bash
pip install -r requirements.txt
```

This will install:
- `requests` - HTTP library for fetching pages
- `beautifulsoup4` - HTML parsing
- `html2text` - HTML to markdown conversion
- `lxml` - Fast HTML parser
- `pyyaml` - YAML parsing for OpenAPI specs

## Usage

### 1. Download Developer Guides

Run the scraper to download developer guides:

```bash
python scrape_pipedrive_docs.py
```

The script will:
1. Start from `https://pipedrive.readme.io/docs/getting-started`
2. Crawl all linked documentation pages
3. Convert each page to markdown
4. Save files to the `docs/` directory
5. Update all cross-references to use relative links
6. Create an `index.md` file with links to all pages

**Output:**
- 81 developer guide pages saved to `docs/`
- Cross-references converted to relative links

### 2. Download API Reference

Download the OpenAPI specifications and convert to markdown:

```bash
# Create API directory
mkdir -p docs/api

# Download OpenAPI specs
curl -o docs/api/openapi-v1.yaml https://developers.pipedrive.com/docs/api/v1/openapi.yaml
curl -o docs/api/openapi-v2.yaml https://developers.pipedrive.com/docs/api/v1/openapi-v2.yaml

# Convert to markdown
python convert_openapi_to_md.py
```

**Output:**
- 274 API v1 endpoint docs in `docs/api/v1/`
- 87 API v2 endpoint docs in `docs/api/v2/`
- Category overview files and index files
- Original YAML specs preserved in `docs/api/`

### Configuration

You can modify the script's behavior by editing these constants at the bottom of `scrape_pipedrive_docs.py`:

```python
BASE_URL = "https://pipedrive.readme.io"          # Base URL of docs site
START_URL = "https://pipedrive.readme.io/docs/getting-started"  # Starting page
OUTPUT_DIR = "docs"                                # Output directory
MAX_PAGES = 500                                    # Maximum pages to scrape
```

## How It Works

1. **Crawling**: Starts from the Getting Started page and follows all documentation links
2. **Content Extraction**: Identifies main content area and removes navigation/sidebars
3. **Conversion**: Converts HTML to markdown using html2text
4. **Link Mapping**: Tracks URL-to-file mappings for cross-references
5. **Link Updates**: Second pass updates all links to relative markdown references
6. **Index Generation**: Creates an index file listing all documentation

## Documentation Structure

```
docs/
├── index.md                           # Developer guides index
├── getting-started.md                 # Getting started guide
├── authentication.md                  # Authentication guide
├── marketplace-oauth-authorization.md # OAuth documentation
├── webhooks-for-apps.md              # Webhooks guide
├── ... (77 more developer guide files)
│
└── api/
    ├── openapi-v1.yaml               # API v1 specification (source)
    ├── openapi-v2.yaml               # API v2 specification (source)
    │
    ├── v1/
    │   ├── index.md                  # API v1 endpoint index
    │   ├── activities.md             # Activities category overview
    │   ├── deals.md                  # Deals category overview
    │   ├── addactivity.md            # POST /activities endpoint
    │   ├── adddeal.md                # POST /deals endpoint
    │   └── ... (270 more v1 endpoint files)
    │
    └── v2/
        ├── index.md                  # API v2 endpoint index
        ├── deals.md                  # Deals category overview (v2)
        ├── adddeal.md                # POST /deals endpoint (v2)
        └── ... (84 more v2 endpoint files)
```

## Rate Limiting

The script includes a 0.5-second delay between requests to be respectful to the server. You can adjust this in the `crawl()` method:

```python
time.sleep(0.5)  # Adjust as needed
```

## Troubleshooting

### No content found
If pages show "No content found", the content selectors may need adjustment. The script tries multiple common selectors, but ReadMe.io may have changed their HTML structure.

### Missing pages
Check the console output to see which URLs were visited. Some pages may be excluded by the `is_valid_doc_url()` filters.

### Links not converting
Ensure the script completes the "Updating cross-references" phase. If interrupted, run the script again - it will update existing files.

## Using Documentation with Claude Code

Once downloaded, you have complete Pipedrive documentation available locally:

### Developer Guides (81 files)
```
"Read docs/marketplace-oauth-authorization.md and help me set up OAuth"

"What does docs/webhooks-for-apps.md say about webhook security?"

"Show me the getting started guide at docs/index.md"
```

### API Reference (361 endpoints)
```
"Read docs/api/v1/adddeal.md and show me how to create a deal"

"What parameters does POST /persons accept? Check docs/api/v1/addperson.md"

"Compare v1 vs v2 for the deals endpoint:
 - docs/api/v1/adddeal.md
 - docs/api/v2/adddeal.md"

"Show me all person-related endpoints from docs/api/v1/persons.md"
```

### Complete Integration Example
```
"I'm building a WhatsApp to Pipedrive integration. Help me:
 1. Check authentication options in docs/core-api-concepts-authentication.md
 2. Find person creation endpoint in docs/api/v1/index.md
 3. Read the detailed schema from docs/api/v1/addperson.md
 4. Check required OAuth scopes in docs/marketplace-scopes-and-permissions-explanations.md"
```

**See also:**
- [USAGE_WITH_CLAUDE.md](USAGE_WITH_CLAUDE.md) - Developer guides usage guide
- [API_REFERENCE_GUIDE.md](API_REFERENCE_GUIDE.md) - API reference usage guide

## Customization

### Exclude specific sections

Modify the `is_valid_doc_url()` method to skip certain URL patterns:

```python
skip_patterns = [
    '/changelog',
    '/discuss',
    '/some-section-to-skip',
]
```

### Change markdown formatting

Modify the `html2text` configuration in `__init__()`:

```python
self.h2t.body_width = 80      # Wrap lines at 80 chars
self.h2t.ignore_images = True # Skip images
```

## License

This is a utility script for personal use. Respect Pipedrive's terms of service when scraping their documentation.
