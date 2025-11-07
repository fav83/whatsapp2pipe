# WhatsApp2Pipe OAuth Backend Service

Azure Functions-based OAuth 2.0 backend service for handling Pipedrive authentication.

## Overview

This service implements a secure OAuth 2.0 flow with:
- **Backend-first pattern**: Tokens stored securely in Azure, never exposed to browser
- **CSRF protection**: State parameter validation using Azure Table Storage
- **Token refresh**: Automatic access token refresh on expiration
- **Session management**: 60-day session lifetime with verification codes

## Architecture

```
┌─────────┐      ┌──────────┐      ┌───────────┐      ┌──────────┐
│Extension│─────▶│/auth/start│─────▶│ Pipedrive │─────▶│/auth/    │
│         │      │           │      │   OAuth   │      │callback  │
│         │      │Creates    │      │           │      │          │
│         │      │state      │      │           │      │Validates │
│         │◀─────┤           │◀─────┤           │◀─────┤state     │
│         │      │Returns    │      │           │      │Exchanges │
│         │      │auth URL   │      │           │      │code      │
│         │      └──────────┘      └───────────┘      │Creates   │
│         │                                            │session   │
│         │                                            │          │
│         │◀───────────────────────────────────────────┤Returns   │
│         │        verification_code                   │code      │
└─────────┘                                            └──────────┘
```

## Prerequisites

- .NET 8 SDK
- Azure subscription
- Azure Functions Core Tools (for local development)
- Azure Storage Account
- Pipedrive Developer account with OAuth app registered

## Project Structure

```
WhatsApp2Pipe.Api/
├── Configuration/       # Configuration models (Pipedrive, Azure settings)
├── Functions/          # HTTP trigger functions
│   ├── AuthStartFunction.cs
│   └── AuthCallbackFunction.cs
├── Models/             # Data models and entities
│   ├── SessionEntity.cs
│   ├── StateEntity.cs
│   ├── AuthStartResponse.cs
│   ├── AuthCallbackResponse.cs
│   ├── PipedriveTokenResponse.cs
│   └── ErrorResponse.cs
├── Services/           # Business logic
│   ├── ITableStorageService.cs
│   ├── TableStorageService.cs
│   ├── IOAuthService.cs
│   └── OAuthService.cs
├── Program.cs          # Application entry point
├── host.json           # Function host configuration
└── local.settings.json # Local development settings
```

## Local Development Setup

### 1. Install Dependencies

```bash
cd Backend/WhatsApp2Pipe.Api
dotnet restore
```

### 2. Configure Azure Storage

You have two options:

**Option A: Use Real Azure Storage** (Recommended)
1. Create a Storage Account in Azure Portal
2. Copy the connection string from "Access keys"
3. Update `local.settings.json`:

```json
{
  "Values": {
    "Azure__StorageConnectionString": "DefaultEndpointsProtocol=https;AccountName=...",
    ...
  }
}
```

**Option B: Use Azurite (Local Emulator)**
1. Install Azurite: `npm install -g azurite`
2. Start Azurite: `azurite --silent`
3. Use the default connection string in `local.settings.json`:
   ```json
   "Azure__StorageConnectionString": "UseDevelopmentStorage=true"
   ```

### 3. Register Pipedrive OAuth App

1. Go to https://developers.pipedrive.com/
2. Create a new app
3. Enable OAuth 2.0
4. Set redirect URI to: `http://localhost:7071/api/auth/callback`
5. Request scope: `contacts:full`
6. Copy `client_id` and `client_secret`

### 4. Update local.settings.json

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",

    "Pipedrive__ClientId": "YOUR_CLIENT_ID",
    "Pipedrive__ClientSecret": "YOUR_CLIENT_SECRET",
    "Pipedrive__RedirectUri": "http://localhost:7071/api/auth/callback",

    "Azure__StorageConnectionString": "YOUR_CONNECTION_STRING"
  }
}
```

### 5. Run Locally

```bash
func start
```

The service will be available at `http://localhost:7071`.

## Testing the Flow

### 1. Start OAuth Flow

```bash
curl http://localhost:7071/api/auth/start
```

Response:
```json
{
  "authorizationUrl": "https://oauth.pipedrive.com/oauth/authorize?client_id=...&state=..."
}
```

### 2. Complete Authorization

1. Open the `authorizationUrl` in a browser
2. Log in to Pipedrive and authorize the app
3. You'll be redirected to `/api/auth/callback` with the result

Response:
```json
{
  "verificationCode": "abc123...",
  "expiresAt": "2025-12-26T10:00:00Z"
}
```

### 3. Store Verification Code

The extension should store this `verificationCode` and include it in all API requests.

## Deployment to Azure

### 1. Create Azure Resources

```bash
# Resource Group
az group create --name whatsapp2pipe-rg --location eastus

# Storage Account
az storage account create \
  --name whatsapp2pipestorage \
  --resource-group whatsapp2pipe-rg \
  --location eastus \
  --sku Standard_LRS

# Function App
az functionapp create \
  --name whatsapp2pipe-auth \
  --resource-group whatsapp2pipe-rg \
  --storage-account whatsapp2pipestorage \
  --runtime dotnet-isolated \
  --runtime-version 8 \
  --functions-version 4 \
  --os-type Linux

# Application Insights
az monitor app-insights component create \
  --app whatsapp2pipe-auth-insights \
  --location eastus \
  --resource-group whatsapp2pipe-rg
```

### 2. Configure Application Settings

```bash
# Get Storage Connection String
STORAGE_CONNECTION=$(az storage account show-connection-string \
  --name whatsapp2pipestorage \
  --resource-group whatsapp2pipe-rg \
  --query connectionString -o tsv)

# Get App Insights Connection String
APPINSIGHTS_CONNECTION=$(az monitor app-insights component show \
  --app whatsapp2pipe-auth-insights \
  --resource-group whatsapp2pipe-rg \
  --query connectionString -o tsv)

# Configure Function App
az functionapp config appsettings set \
  --name whatsapp2pipe-auth \
  --resource-group whatsapp2pipe-rg \
  --settings \
    "Pipedrive__ClientId=YOUR_CLIENT_ID" \
    "Pipedrive__ClientSecret=YOUR_CLIENT_SECRET" \
    "Pipedrive__RedirectUri=https://whatsapp2pipe-auth.azurewebsites.net/api/auth/callback" \
    "Azure__StorageConnectionString=$STORAGE_CONNECTION" \
    "APPLICATIONINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONNECTION"
```

### 3. Deploy Function App

```bash
cd Backend/WhatsApp2Pipe.Api
func azure functionapp publish whatsapp2pipe-auth
```

### 4. Update Pipedrive OAuth App

Update your Pipedrive app's redirect URI to:
```
https://whatsapp2pipe-auth.azurewebsites.net/api/auth/callback
```

## API Reference

### GET /api/auth/start

Initiates the OAuth flow by generating a state parameter and returning the Pipedrive authorization URL.

**Response:**
```json
{
  "authorizationUrl": "https://oauth.pipedrive.com/oauth/authorize?..."
}
```

**Errors:**
- `500 Internal Error`: Server error

### GET /api/auth/callback

Handles the OAuth callback, validates state, exchanges code for tokens, and creates a session.

**Query Parameters:**
- `code`: Authorization code from Pipedrive
- `state`: CSRF protection state parameter

**Response:**
```json
{
  "verificationCode": "abc123...",
  "expiresAt": "2025-12-26T10:00:00Z"
}
```

**Errors:**
- `400 Bad Request`:
  - `oauth_error`: Pipedrive returned an error
  - `missing_code`: Authorization code missing
  - `missing_state`: State parameter missing
  - `invalid_state`: Invalid or expired state
  - `token_exchange_failed`: Failed to exchange code
- `500 Internal Error`: Server error

## Configuration Reference

### Pipedrive Settings

| Setting | Description | Example |
|---------|-------------|---------|
| `Pipedrive__ClientId` | OAuth client ID | `abc123...` |
| `Pipedrive__ClientSecret` | OAuth client secret | `xyz789...` |
| `Pipedrive__RedirectUri` | OAuth callback URL | `http://localhost:7071/api/auth/callback` |
| `Pipedrive__AuthorizationEndpoint` | Pipedrive auth URL | `https://oauth.pipedrive.com/oauth/authorize` |
| `Pipedrive__TokenEndpoint` | Pipedrive token URL | `https://oauth.pipedrive.com/oauth/token` |
| `Pipedrive__Scope` | OAuth scopes | `contacts:full` |
| `Pipedrive__BaseUrl` | Pipedrive API base URL | `https://api.pipedrive.com` |
| `Pipedrive__ApiVersion` | Pipedrive API version | `v1` |

### Azure Settings

| Setting | Description | Example |
|---------|-------------|---------|
| `Azure__StorageConnectionString` | Table Storage connection | `DefaultEndpointsProtocol=https;...` |
| `Azure__SessionTableName` | Session table name | `sessions` |
| `Azure__StateTableName` | State table name | `states` |
| `Azure__SessionExpirationDays` | Session lifetime | `60` |
| `Azure__StateExpirationMinutes` | State lifetime (CSRF) | `5` |

## Security Considerations

1. **Never commit secrets**: `local.settings.json` is in `.gitignore`
2. **HTTPS in production**: Azure Functions enforce HTTPS by default
3. **State validation**: All callbacks validate state parameter
4. **Token storage**: Tokens stored in Azure Table Storage, never exposed to browser
5. **Session expiration**: Sessions expire after 60 days
6. **State expiration**: State parameters expire after 5 minutes

## Monitoring

### Application Insights

View logs and telemetry in Azure Portal:
1. Navigate to your Function App
2. Click "Application Insights"
3. View Live Metrics, Logs, and Performance

### Local Logs

When running locally, logs appear in the terminal:
```
[2025-10-26T10:00:00.000Z] AuthStart endpoint called
[2025-10-26T10:00:00.100Z] Created state abc123, expires at 2025-10-26T10:05:00Z
[2025-10-26T10:00:00.200Z] AuthStart completed successfully
```

## Troubleshooting

### "Cannot find module" errors
```bash
dotnet restore
```

### "Connection refused" to Table Storage
- Ensure Azurite is running: `azurite --silent`
- Or use real Azure Storage connection string

### "Invalid client_id" from Pipedrive
- Verify `Pipedrive__ClientId` in settings
- Ensure OAuth app is properly registered

### "Invalid redirect_uri"
- Verify `Pipedrive__RedirectUri` matches Pipedrive app settings
- For local dev: `http://localhost:7071/api/auth/callback`
- For production: `https://your-function-app.azurewebsites.net/api/auth/callback`

## Next Steps

After deploying this backend service, update Spec-105b to:
1. Call `/api/auth/start` from the extension
2. Open authorization URL in popup window
3. Listen for callback with verification code
4. Store verification code in chrome.storage
5. Include verification code in all Pipedrive API requests

## License

Copyright © 2025 WhatsApp2Pipe Project
