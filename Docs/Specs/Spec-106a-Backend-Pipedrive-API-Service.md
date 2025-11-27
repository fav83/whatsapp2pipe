# Spec-106a: Backend Pipedrive API Service

**Feature:** Feature 6 - Pipedrive API Service Layer (Backend)
**Date:** 2025-10-28
**Status:** Draft
**Dependencies:** Spec-105a (Backend OAuth Service must be deployed)

---

## Implementation Split

Feature 6 (Pipedrive API Service Layer) is split into two independent specifications:

- **Spec-106a (This Document):** Backend Pipedrive API Service - Azure Functions + C# + Pipedrive API integration
- **Spec-106b:** Extension Pipedrive API Integration - TypeScript + React + Service Worker

**Implementation Order:**
1. Spec-106a (Backend) - Can be developed and tested independently
2. Spec-106b (Extension) - Integrates with deployed backend

---

**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Sections 4.3, 4.4, 4.5 (Person operations)
- [Spec-105a-Backend-OAuth-Service.md](Spec-105a-Backend-OAuth-Service.md) - OAuth foundation
- [Spec-106b-Extension-Pipedrive-API-Integration.md](Spec-106b-Extension-Pipedrive-API-Integration.md) - Extension counterpart

---

## 1. Overview

Implement backend proxy API service that enables the Chrome extension to interact with Pipedrive API. The backend validates user sessions, retrieves OAuth tokens, calls Pipedrive API, and returns transformed responses with only necessary data.

**Why this matters:** The extension cannot call Pipedrive API directly because OAuth tokens are stored securely in the backend (Azure Table Storage). The backend acts as a secure proxy that validates sessions and makes authenticated Pipedrive API calls.

**Architecture Pattern:** Backend Proxy - Extension sends `verification_code` → Backend validates session → Backend calls Pipedrive with stored tokens → Backend transforms and returns minimal data.

---

## 2. Objectives

- Implement 3 HTTP endpoints for Pipedrive Person operations
- Validate `verification_code` and retrieve OAuth tokens from Azure Table Storage
- Call Pipedrive API with stored access tokens
- Transform Pipedrive responses to minimal format (return only necessary fields)
- Handle Pipedrive API errors gracefully (rate limits, token expiry, etc.)
- Support BRD requirements: Person lookup, create, and phone attachment

---

## 3. Architecture Overview

### 3.1 Component Structure

```
Backend/
├── Functions/
│   ├── PipedrivePersonsSearchFunction.cs     # GET /api/pipedrive/persons/search
│   ├── PipedrivePersonsCreateFunction.cs     # POST /api/pipedrive/persons
│   └── PipedrivePersonsAttachPhoneFunction.cs # POST /api/pipedrive/persons/{id}/attach-phone
├── Services/
│   ├── IPipedriveApiClient.cs                # Pipedrive API client interface
│   ├── PipedriveApiClient.cs                 # Pipedrive HTTP client implementation
│   └── PersonTransformService.cs             # Transform Pipedrive responses
├── Models/
│   ├── PipedriveModels.cs                    # Full Pipedrive API response models
│   └── PersonModels.cs                       # Minimal Person models for extension
└── Configuration/
    └── PipedriveConfig.cs                    # Pipedrive API configuration
```

### 3.2 Data Flow

```
Extension (Content Script)
    ↓ (HTTPS Request with verification_code in Authorization header)
Backend Azure Function
    ↓ (Validate verification_code)
Azure Table Storage
    ↓ (Retrieve access_token and refresh_token)
Backend Azure Function
    ↓ (Call Pipedrive API with access_token)
Pipedrive API
    ↓ (Return full response)
Backend Azure Function (Transform to minimal format)
    ↓ (Return { id, name, phones, email })
Extension (Content Script)
```

---

## 4. Functional Requirements

### 4.1 Endpoint 1: Search Persons

**Endpoint:**
```
GET /api/pipedrive/persons/search?term={searchTerm}&fields={fields}
Authorization: Bearer {verification_code}
```

**Query Parameters:**
- `term` (required, string): Search term (phone number or name)
- `fields` (required, string): Comma-separated fields to search (`phone`, `name`)

**Purpose:** Search Pipedrive persons by phone number or name. Used for:
- Person lookup by phone (BRD Section 4.3)
- Person search by name for "Attach to existing" flow (BRD Section 4.5)

**Backend Logic:**

1. **Extract and Validate Authorization:**
   ```csharp
   // Extract verification_code from Authorization header
   string authHeader = req.Headers["Authorization"];
   if (!authHeader.StartsWith("Bearer "))
       return new UnauthorizedResult();

   string verificationCode = authHeader.Substring("Bearer ".Length);
   ```

2. **Retrieve Session:**
   ```csharp
   // Query Azure Table Storage for session
   var session = await sessionStore.GetSessionAsync(verificationCode);
   if (session == null || session.IsExpired())
       return new UnauthorizedResult();

   string accessToken = session.AccessToken;
   ```

3. **Call Pipedrive API:**
   ```csharp
   // GET https://api.pipedrive.com/v1/persons/search
   var url = $"{pipedriveConfig.BaseUrl}/v1/persons/search?term={Uri.EscapeDataString(term)}&fields={fields}";
   var request = new HttpRequestMessage(HttpMethod.Get, url);
   request.Headers.Add("Authorization", $"Bearer {accessToken}");

   var response = await httpClient.SendAsync(request);
   ```

4. **Handle Pipedrive Errors:**
   ```csharp
   if (!response.IsSuccessStatusCode)
   {
       if (response.StatusCode == HttpStatusCode.Unauthorized)
       {
           // Token expired - attempt refresh (reuse logic from Spec-105a)
           // If refresh fails, return 401
       }
       if (response.StatusCode == (HttpStatusCode)429)
       {
           // Rate limit - return 429 with appropriate message
           return new StatusCodeResult(429);
       }
       // Other errors - return 500
       return new StatusCodeResult(500);
   }
   ```

5. **Transform Response:**
   ```csharp
   var pipedriveResponse = await response.Content.ReadAsAsync<PipedriveSearchResponse>();

   // Transform to minimal format
   var persons = pipedriveResponse.Data.Items.Select(item => new Person
   {
       Id = item.Item.Id,
       Name = item.Item.Name,
       Phones = TransformPhones(item.Item.Phones),
       Email = ExtractPrimaryEmail(item.Item.Emails)
   }).ToArray();

   return new OkObjectResult(persons);
   ```

**Response Models:**

```csharp
// Response: 200 OK
[
  {
    "id": 123,
    "name": "John Smith",
    "phones": [
      { "value": "+48123456789", "label": "mobile", "isPrimary": true },
      { "value": "+48987654321", "label": "work", "isPrimary": false }
    ],
    "email": "john@example.com"
  }
]

// Response: 404 Not Found (or empty array)
[]

// Response: 401 Unauthorized
// Response: 429 Too Many Requests
// Response: 500 Internal Server Error
```

**Acceptance Criteria:**
- ✅ Validates `verification_code` from Authorization header
- ✅ Retrieves OAuth tokens from Azure Table Storage
- ✅ Calls Pipedrive `/persons/search` endpoint
- ✅ Returns array of persons in minimal format
- ✅ Returns empty array `[]` when no matches found (not 404)
- ✅ Handles token expiry with refresh logic
- ✅ Returns appropriate HTTP status codes for errors
- ✅ Transforms Pipedrive response to minimal Person format

---

### 4.2 Endpoint 2: Create Person

**Endpoint:**
```
POST /api/pipedrive/persons
Authorization: Bearer {verification_code}
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+48123456789",
  "email": "john@example.com"  // optional
}
```

**Request Body:**
- `name` (required, string): Person's full name
- `phone` (required, string): WhatsApp phone in E.164 format (e.g., `+48123456789`)
- `email` (optional, string): Email address

**Purpose:** Create new Pipedrive person with WhatsApp phone number (BRD Section 4.4)

**Backend Logic:**

1. **Validate Request Body:**
   ```csharp
   var requestData = await req.Content.ReadAsAsync<CreatePersonRequest>();

   if (string.IsNullOrEmpty(requestData.Name))
       return new BadRequestObjectResult("Name is required");

   if (string.IsNullOrEmpty(requestData.Phone))
       return new BadRequestObjectResult("Phone is required");

   // Validate E.164 format (starts with +)
   if (!requestData.Phone.StartsWith("+"))
       return new BadRequestObjectResult("Phone must be in E.164 format");
   ```

2. **Transform to Pipedrive Format:**
   ```csharp
   var pipedriveRequest = new
   {
       name = requestData.Name,
       phone = new[]
       {
           new
           {
               value = requestData.Phone,
               label = "WhatsApp",
               primary = false  // BRD requirement: NOT primary
           }
       },
       email = string.IsNullOrEmpty(requestData.Email) ? null : new[]
       {
           new
           {
               value = requestData.Email,
               label = "work",
               primary = true
           }
       }
   };
   ```

3. **Call Pipedrive API:**
   ```csharp
   // POST https://api.pipedrive.com/v1/persons
   var url = $"{pipedriveConfig.BaseUrl}/v1/persons";
   var request = new HttpRequestMessage(HttpMethod.Post, url);
   request.Headers.Add("Authorization", $"Bearer {accessToken}");
   request.Content = new StringContent(
       JsonConvert.SerializeObject(pipedriveRequest),
       Encoding.UTF8,
       "application/json"
   );

   var response = await httpClient.SendAsync(request);
   ```

4. **Transform and Return:**
   ```csharp
   var pipedriveResponse = await response.Content.ReadAsAsync<PipedrivePersonResponse>();

   var person = new Person
   {
       Id = pipedriveResponse.Data.Id,
       Name = pipedriveResponse.Data.Name,
       Phones = TransformPhones(pipedriveResponse.Data.Phone),
       Email = ExtractPrimaryEmail(pipedriveResponse.Data.Email)
   };

   return new ObjectResult(person) { StatusCode = 201 };
   ```

**Response Models:**

```csharp
// Response: 201 Created
{
  "id": 456,
  "name": "John Smith",
  "phones": [
    { "value": "+48123456789", "label": "WhatsApp", "isPrimary": false }
  ],
  "email": "john@example.com"
}

// Response: 400 Bad Request - Invalid request body
// Response: 401 Unauthorized - Invalid verification_code
// Response: 500 Internal Server Error - Pipedrive API error
```

**BRD Requirement Validation:**
- ✅ Phone saved with label **"WhatsApp"**
- ✅ Phone marked as **NOT primary** (`primary: false`)
- ✅ Name is required
- ✅ Email is optional

**Acceptance Criteria:**
- ✅ Validates request body (name and phone required)
- ✅ Validates phone is in E.164 format
- ✅ Transforms request to Pipedrive format
- ✅ Sets phone label to "WhatsApp" and primary to false
- ✅ Handles optional email field
- ✅ Returns 201 Created on success
- ✅ Returns created person in minimal format

---

### 4.3 Endpoint 3: Attach Phone to Person

**Endpoint:**
```
POST /api/pipedrive/persons/{id}/attach-phone
Authorization: Bearer {verification_code}
Content-Type: application/json

{
  "phone": "+48123456789"
}
```

**Path Parameters:**
- `id` (required, integer): Pipedrive person ID

**Request Body:**
- `phone` (required, string): WhatsApp phone in E.164 format

**Purpose:** Add WhatsApp phone to existing Pipedrive person (BRD Section 4.5)

**Backend Logic:**

1. **Fetch Existing Person:**
   ```csharp
   // GET https://api.pipedrive.com/v1/persons/{id}
   var getUrl = $"{pipedriveConfig.BaseUrl}/v1/persons/{personId}";
   var getRequest = new HttpRequestMessage(HttpMethod.Get, getUrl);
   getRequest.Headers.Add("Authorization", $"Bearer {accessToken}");

   var getResponse = await httpClient.SendAsync(getRequest);

   if (getResponse.StatusCode == HttpStatusCode.NotFound)
       return new NotFoundResult();

   var existingPerson = await getResponse.Content.ReadAsAsync<PipedrivePersonResponse>();
   ```

2. **Check for Duplicate:**
   ```csharp
   // Check if phone already exists
   var existingPhones = existingPerson.Data.Phone ?? new List<PipedrivePhone>();

   if (existingPhones.Any(p => p.Value == requestData.Phone))
   {
       // Phone already exists - return person as-is (no error)
       return new OkObjectResult(TransformPerson(existingPerson.Data));
   }
   ```

3. **Merge Phones:**
   ```csharp
   // Add new phone to existing phones array
   var updatedPhones = existingPhones.Select(p => new
   {
       value = p.Value,
       label = p.Label,
       primary = p.Primary
   }).ToList();

   updatedPhones.Add(new
   {
       value = requestData.Phone,
       label = "WhatsApp",
       primary = false  // BRD requirement: NOT primary
   });
   ```

4. **Update Person:**
   ```csharp
   // PATCH https://api.pipedrive.com/v1/persons/{id}
   var updateUrl = $"{pipedriveConfig.BaseUrl}/v1/persons/{personId}";
   var updateRequest = new HttpRequestMessage(new HttpMethod("PATCH"), updateUrl);
   updateRequest.Headers.Add("Authorization", $"Bearer {accessToken}");
   updateRequest.Content = new StringContent(
       JsonConvert.SerializeObject(new { phone = updatedPhones }),
       Encoding.UTF8,
       "application/json"
   );

   var updateResponse = await httpClient.SendAsync(updateRequest);
   ```

5. **Transform and Return:**
   ```csharp
   var updatedPerson = await updateResponse.Content.ReadAsAsync<PipedrivePersonResponse>();

   return new OkObjectResult(TransformPerson(updatedPerson.Data));
   ```

**Response Models:**

```csharp
// Response: 200 OK
{
  "id": 456,
  "name": "John Smith",
  "phones": [
    { "value": "+48111111111", "label": "mobile", "isPrimary": true },
    { "value": "+48123456789", "label": "WhatsApp", "isPrimary": false }
  ],
  "email": "john@example.com"
}

// Response: 404 Not Found - Person with ID not found
// Response: 401 Unauthorized - Invalid verification_code
// Response: 500 Internal Server Error - Pipedrive API error
```

**BRD Requirement Validation:**
- ✅ Phone added with label **"WhatsApp"**
- ✅ Phone marked as **NOT primary** (`primary: false`)
- ✅ Existing phones preserved
- ✅ Duplicate phone detection (idempotent operation)

**Acceptance Criteria:**
- ✅ Fetches existing person from Pipedrive
- ✅ Returns 404 if person not found
- ✅ Checks for duplicate phone (returns success if already exists)
- ✅ Merges new phone with existing phones
- ✅ Sets new phone label to "WhatsApp" and primary to false
- ✅ Preserves all existing phones and their primary flags
- ✅ Updates person with PATCH request
- ✅ Returns updated person in minimal format

---

## 5. Data Models

### 5.1 Request Models (Extension → Backend)

```csharp
/// <summary>
/// Request to create a new person
/// </summary>
public class CreatePersonRequest
{
    /// <summary>
    /// Person's full name (required)
    /// </summary>
    [Required]
    public string Name { get; set; }

    /// <summary>
    /// WhatsApp phone in E.164 format (required)
    /// Example: "+48123456789"
    /// </summary>
    [Required]
    public string Phone { get; set; }

    /// <summary>
    /// Email address (optional)
    /// </summary>
    public string Email { get; set; }
}

/// <summary>
/// Request to attach phone to existing person
/// </summary>
public class AttachPhoneRequest
{
    /// <summary>
    /// WhatsApp phone in E.164 format (required)
    /// Example: "+48123456789"
    /// </summary>
    [Required]
    public string Phone { get; set; }
}
```

### 5.2 Response Models (Backend → Extension)

**Minimal Person Model:**

```csharp
/// <summary>
/// Minimal person data returned to extension
/// Transformed from full Pipedrive response
/// </summary>
public class Person
{
    /// <summary>
    /// Pipedrive person ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Person's full name
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// All phone numbers (can be empty array)
    /// </summary>
    public Phone[] Phones { get; set; }

    /// <summary>
    /// Primary email or null if none exists
    /// </summary>
    public string Email { get; set; }
}

/// <summary>
/// Phone number with label and primary flag
/// </summary>
public class Phone
{
    /// <summary>
    /// Phone number in E.164 format
    /// Example: "+48123456789"
    /// </summary>
    public string Value { get; set; }

    /// <summary>
    /// Phone label (mobile, work, home, WhatsApp, etc.)
    /// </summary>
    public string Label { get; set; }

    /// <summary>
    /// True if this is the primary phone
    /// </summary>
    public bool IsPrimary { get; set; }
}
```

### 5.3 Pipedrive API Models (Internal)

**Full Pipedrive Response Models:**

```csharp
/// <summary>
/// Pipedrive search response
/// </summary>
public class PipedriveSearchResponse
{
    public bool Success { get; set; }
    public PipedriveSearchData Data { get; set; }
}

public class PipedriveSearchData
{
    public PipedriveSearchItem[] Items { get; set; }
}

public class PipedriveSearchItem
{
    public PipedrivePerson Item { get; set; }
}

/// <summary>
/// Pipedrive person response
/// </summary>
public class PipedrivePersonResponse
{
    public bool Success { get; set; }
    public PipedrivePerson Data { get; set; }
}

/// <summary>
/// Full Pipedrive person object
/// </summary>
public class PipedrivePerson
{
    public int Id { get; set; }
    public string Name { get; set; }

    [JsonProperty("phone")]
    public List<PipedrivePhone> Phone { get; set; }

    [JsonProperty("email")]
    public List<PipedriveEmail> Email { get; set; }

    // ... many other fields we don't need
}

public class PipedrivePhone
{
    public string Value { get; set; }
    public string Label { get; set; }
    public bool Primary { get; set; }
}

public class PipedriveEmail
{
    public string Value { get; set; }
    public string Label { get; set; }
    public bool Primary { get; set; }
}
```

### 5.4 Transformation Logic

```csharp
/// <summary>
/// Service to transform Pipedrive responses to minimal format
/// </summary>
public class PersonTransformService
{
    /// <summary>
    /// Transform full Pipedrive person to minimal Person
    /// </summary>
    public Person TransformPerson(PipedrivePerson pipedrivePerson)
    {
        return new Person
        {
            Id = pipedrivePerson.Id,
            Name = pipedrivePerson.Name,
            Phones = TransformPhones(pipedrivePerson.Phone),
            Email = ExtractPrimaryEmail(pipedrivePerson.Email)
        };
    }

    /// <summary>
    /// Transform Pipedrive phone array to our Phone array
    /// </summary>
    public Phone[] TransformPhones(List<PipedrivePhone> pipedrivePhones)
    {
        if (pipedrivePhones == null || pipedrivePhones.Count == 0)
            return new Phone[0];

        return pipedrivePhones.Select(p => new Phone
        {
            Value = p.Value,
            Label = p.Label ?? "other",
            IsPrimary = p.Primary
        }).ToArray();
    }

    /// <summary>
    /// Extract primary email or first email or null
    /// </summary>
    public string ExtractPrimaryEmail(List<PipedriveEmail> pipedriveEmails)
    {
        if (pipedriveEmails == null || pipedriveEmails.Count == 0)
            return null;

        // Try to find primary email
        var primaryEmail = pipedriveEmails.FirstOrDefault(e => e.Primary);
        if (primaryEmail != null)
            return primaryEmail.Value;

        // Otherwise return first email
        return pipedriveEmails[0].Value;
    }
}
```

---

## 6. Configuration

### 6.1 Application Settings

**local.settings.json (Development):**

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet",
    "AzureTableStorageConnectionString": "UseDevelopmentStorage=true",
    "Pipedrive__BaseUrl": "https://api.pipedrive.com",
    "Pipedrive__ApiVersion": "v1",
    "AllowedOrigins": "https://web.whatsapp.com"
  }
}
```

**Azure Function App Configuration (Production):**

```
AzureTableStorageConnectionString = <connection-string>
Pipedrive__BaseUrl = https://api.pipedrive.com
Pipedrive__ApiVersion = v1
AllowedOrigins = https://web.whatsapp.com
```

### 6.2 Configuration Class

```csharp
/// <summary>
/// Pipedrive API configuration
/// </summary>
public class PipedriveConfig
{
    public string BaseUrl { get; set; }
    public string ApiVersion { get; set; }

    public string GetApiUrl(string endpoint)
    {
        return $"{BaseUrl}/{ApiVersion}{endpoint}";
    }
}
```

---

## 7. Error Handling

### 7.1 Error Response Format

**All errors use standard HTTP status codes (no custom error response body for MVP):**

```csharp
// 401 Unauthorized
return new UnauthorizedResult();

// 404 Not Found
return new NotFoundResult();

// 429 Too Many Requests
return new StatusCodeResult(429);

// 500 Internal Server Error
return new StatusCodeResult(500);

// 400 Bad Request
return new BadRequestObjectResult("Error message");
```

### 7.2 Error Scenarios

| Scenario | Detection | HTTP Status | Backend Action |
|----------|-----------|-------------|----------------|
| Invalid verification_code | Not found in Azure Table Storage | 401 | Return UnauthorizedResult |
| Expired verification_code | Session.ExpiresAt < DateTime.UtcNow | 401 | Return UnauthorizedResult |
| Pipedrive token expired | Pipedrive returns 401 | 401 | Attempt token refresh, then retry |
| Token refresh fails | Refresh token invalid | 401 | Return UnauthorizedResult |
| Person not found | Pipedrive returns 404 | 404 | Return NotFoundResult |
| Pipedrive rate limit | Pipedrive returns 429 | 429 | Return StatusCodeResult(429) |
| Pipedrive API error | Pipedrive returns 500 | 500 | Log error, return StatusCodeResult(500) |
| Invalid request body | Model validation fails | 400 | Return BadRequestObjectResult |
| Network error | HttpClient throws | 500 | Log error, return StatusCodeResult(500) |

### 7.3 Token Refresh Logic

```csharp
/// <summary>
/// Handle Pipedrive API 401 response by refreshing token
/// </summary>
private async Task<HttpResponseMessage> CallPipedriveWithTokenRefresh(
    Func<string, Task<HttpResponseMessage>> apiCall,
    Session session)
{
    // First attempt with current access token
    var response = await apiCall(session.AccessToken);

    if (response.StatusCode == HttpStatusCode.Unauthorized)
    {
        // Token expired - attempt refresh
        var refreshed = await RefreshPipedriveTokenAsync(session);

        if (!refreshed)
        {
            // Refresh failed - user needs to re-authenticate
            return new HttpResponseMessage(HttpStatusCode.Unauthorized);
        }

        // Retry with new access token
        response = await apiCall(session.AccessToken);
    }

    return response;
}

/// <summary>
/// Refresh Pipedrive access token using refresh token
/// Reuses logic from Spec-105a
/// </summary>
private async Task<bool> RefreshPipedriveTokenAsync(Session session)
{
    // Call Pipedrive token refresh endpoint
    // Update session in Azure Table Storage
    // Return true if successful, false otherwise
    // (Implementation details in Spec-105a)
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Test Coverage:**

```csharp
// PersonsSearchFunctionTests.cs
[TestClass]
public class PersonsSearchFunctionTests
{
    [TestMethod]
    public async Task SearchPersons_ValidPhone_ReturnsTransformedPerson()
    {
        // Arrange
        var mockPipedriveClient = new Mock<IPipedriveApiClient>();
        var mockSessionStore = new Mock<ISessionStore>();

        mockSessionStore
            .Setup(x => x.GetSessionAsync("valid_code"))
            .ReturnsAsync(new Session { AccessToken = "token123" });

        mockPipedriveClient
            .Setup(x => x.SearchPersonsAsync("token123", "+48123456789", "phone"))
            .ReturnsAsync(new PipedriveSearchResponse
            {
                Success = true,
                Data = new PipedriveSearchData
                {
                    Items = new[]
                    {
                        new PipedriveSearchItem
                        {
                            Item = new PipedrivePerson
                            {
                                Id = 123,
                                Name = "John Smith",
                                Phone = new List<PipedrivePhone>
                                {
                                    new PipedrivePhone { Value = "+48123456789", Label = "mobile", Primary = true }
                                }
                            }
                        }
                    }
                }
            });

        // Act
        var result = await function.SearchPersons(request);

        // Assert
        Assert.IsInstanceOfType(result, typeof(OkObjectResult));
        var okResult = (OkObjectResult)result;
        var persons = (Person[])okResult.Value;
        Assert.AreEqual(1, persons.Length);
        Assert.AreEqual(123, persons[0].Id);
        Assert.AreEqual("John Smith", persons[0].Name);
        Assert.AreEqual("+48123456789", persons[0].Phones[0].Value);
        Assert.IsTrue(persons[0].Phones[0].IsPrimary);
    }

    [TestMethod]
    public async Task SearchPersons_NoMatches_ReturnsEmptyArray()
    {
        // Arrange
        mockPipedriveClient
            .Setup(x => x.SearchPersonsAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(new PipedriveSearchResponse
            {
                Success = true,
                Data = new PipedriveSearchData { Items = new PipedriveSearchItem[0] }
            });

        // Act
        var result = await function.SearchPersons(request);

        // Assert
        var okResult = (OkObjectResult)result;
        var persons = (Person[])okResult.Value;
        Assert.AreEqual(0, persons.Length);
    }

    [TestMethod]
    public async Task SearchPersons_InvalidVerificationCode_Returns401()
    {
        // Arrange
        mockSessionStore
            .Setup(x => x.GetSessionAsync("invalid_code"))
            .ReturnsAsync((Session)null);

        // Act
        var result = await function.SearchPersons(request);

        // Assert
        Assert.IsInstanceOfType(result, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task SearchPersons_PipedriveRateLimit_Returns429()
    {
        // Arrange
        mockPipedriveClient
            .Setup(x => x.SearchPersonsAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ThrowsAsync(new PipedriveRateLimitException());

        // Act
        var result = await function.SearchPersons(request);

        // Assert
        Assert.IsInstanceOfType(result, typeof(StatusCodeResult));
        Assert.AreEqual(429, ((StatusCodeResult)result).StatusCode);
    }
}

// PersonsCreateFunctionTests.cs
[TestClass]
public class PersonsCreateFunctionTests
{
    [TestMethod]
    public async Task CreatePerson_ValidData_AddsWhatsAppLabel()
    {
        // Arrange
        var createRequest = new CreatePersonRequest
        {
            Name = "John Smith",
            Phone = "+48123456789",
            Email = "john@example.com"
        };

        mockPipedriveClient
            .Setup(x => x.CreatePersonAsync(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(new PipedrivePersonResponse
            {
                Success = true,
                Data = new PipedrivePerson
                {
                    Id = 456,
                    Name = "John Smith",
                    Phone = new List<PipedrivePhone>
                    {
                        new PipedrivePhone { Value = "+48123456789", Label = "WhatsApp", Primary = false }
                    },
                    Email = new List<PipedriveEmail>
                    {
                        new PipedriveEmail { Value = "john@example.com", Label = "work", Primary = true }
                    }
                }
            });

        // Act
        var result = await function.CreatePerson(request);

        // Assert
        var objectResult = (ObjectResult)result;
        Assert.AreEqual(201, objectResult.StatusCode);
        var person = (Person)objectResult.Value;
        Assert.AreEqual("WhatsApp", person.Phones[0].Label);
        Assert.IsFalse(person.Phones[0].IsPrimary);
    }

    [TestMethod]
    public async Task CreatePerson_MissingName_Returns400()
    {
        // Arrange
        var createRequest = new CreatePersonRequest
        {
            Name = "",
            Phone = "+48123456789"
        };

        // Act
        var result = await function.CreatePerson(request);

        // Assert
        Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
    }

    [TestMethod]
    public async Task CreatePerson_InvalidPhoneFormat_Returns400()
    {
        // Arrange
        var createRequest = new CreatePersonRequest
        {
            Name = "John",
            Phone = "123456789"  // Missing +
        };

        // Act
        var result = await function.CreatePerson(request);

        // Assert
        Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
    }
}

// PersonsAttachPhoneFunctionTests.cs
[TestClass]
public class PersonsAttachPhoneFunctionTests
{
    [TestMethod]
    public async Task AttachPhone_ExistingPerson_MergesPhones()
    {
        // Arrange
        var existingPerson = new PipedrivePerson
        {
            Id = 123,
            Name = "John Smith",
            Phone = new List<PipedrivePhone>
            {
                new PipedrivePhone { Value = "+48111111111", Label = "mobile", Primary = true }
            }
        };

        mockPipedriveClient
            .Setup(x => x.GetPersonAsync(It.IsAny<string>(), 123))
            .ReturnsAsync(new PipedrivePersonResponse { Success = true, Data = existingPerson });

        mockPipedriveClient
            .Setup(x => x.UpdatePersonAsync(It.IsAny<string>(), 123, It.IsAny<object>()))
            .ReturnsAsync(new PipedrivePersonResponse
            {
                Success = true,
                Data = new PipedrivePerson
                {
                    Id = 123,
                    Name = "John Smith",
                    Phone = new List<PipedrivePhone>
                    {
                        new PipedrivePhone { Value = "+48111111111", Label = "mobile", Primary = true },
                        new PipedrivePhone { Value = "+48123456789", Label = "WhatsApp", Primary = false }
                    }
                }
            });

        // Act
        var result = await function.AttachPhone(request, 123);

        // Assert
        var okResult = (OkObjectResult)result;
        var person = (Person)okResult.Value;
        Assert.AreEqual(2, person.Phones.Length);
        Assert.IsTrue(person.Phones.Any(p => p.Value == "+48123456789" && p.Label == "WhatsApp"));
        Assert.IsTrue(person.Phones.Any(p => p.Value == "+48111111111" && p.IsPrimary));
    }

    [TestMethod]
    public async Task AttachPhone_DuplicatePhone_ReturnsPersonAsIs()
    {
        // Arrange
        var existingPerson = new PipedrivePerson
        {
            Id = 123,
            Name = "John Smith",
            Phone = new List<PipedrivePhone>
            {
                new PipedrivePhone { Value = "+48123456789", Label = "mobile", Primary = true }
            }
        };

        mockPipedriveClient
            .Setup(x => x.GetPersonAsync(It.IsAny<string>(), 123))
            .ReturnsAsync(new PipedrivePersonResponse { Success = true, Data = existingPerson });

        // Act
        var result = await function.AttachPhone(request, 123);

        // Assert
        var okResult = (OkObjectResult)result;
        var person = (Person)okResult.Value;
        Assert.AreEqual(1, person.Phones.Length);  // No duplicate added
        mockPipedriveClient.Verify(x => x.UpdatePersonAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<object>()), Times.Never);
    }

    [TestMethod]
    public async Task AttachPhone_PersonNotFound_Returns404()
    {
        // Arrange
        mockPipedriveClient
            .Setup(x => x.GetPersonAsync(It.IsAny<string>(), 999))
            .ThrowsAsync(new PipedriveNotFoundException());

        // Act
        var result = await function.AttachPhone(request, 999);

        // Assert
        Assert.IsInstanceOfType(result, typeof(NotFoundResult));
    }
}

// PersonTransformServiceTests.cs
[TestClass]
public class PersonTransformServiceTests
{
    [TestMethod]
    public void TransformPhones_MultiplePhones_TransformsCorrectly()
    {
        // Arrange
        var pipedrivePhones = new List<PipedrivePhone>
        {
            new PipedrivePhone { Value = "+48111111111", Label = "mobile", Primary = true },
            new PipedrivePhone { Value = "+48222222222", Label = "work", Primary = false }
        };

        // Act
        var result = service.TransformPhones(pipedrivePhones);

        // Assert
        Assert.AreEqual(2, result.Length);
        Assert.AreEqual("+48111111111", result[0].Value);
        Assert.IsTrue(result[0].IsPrimary);
        Assert.AreEqual("mobile", result[0].Label);
        Assert.IsFalse(result[1].IsPrimary);
    }

    [TestMethod]
    public void ExtractPrimaryEmail_HasPrimary_ReturnsPrimary()
    {
        // Arrange
        var emails = new List<PipedriveEmail>
        {
            new PipedriveEmail { Value = "john@example.com", Primary = false },
            new PipedriveEmail { Value = "john.smith@example.com", Primary = true }
        };

        // Act
        var result = service.ExtractPrimaryEmail(emails);

        // Assert
        Assert.AreEqual("john.smith@example.com", result);
    }

    [TestMethod]
    public void ExtractPrimaryEmail_NoPrimary_ReturnsFirst()
    {
        // Arrange
        var emails = new List<PipedriveEmail>
        {
            new PipedriveEmail { Value = "john@example.com", Primary = false },
            new PipedriveEmail { Value = "john2@example.com", Primary = false }
        };

        // Act
        var result = service.ExtractPrimaryEmail(emails);

        // Assert
        Assert.AreEqual("john@example.com", result);
    }

    [TestMethod]
    public void ExtractPrimaryEmail_NoEmails_ReturnsNull()
    {
        // Act
        var result = service.ExtractPrimaryEmail(null);

        // Assert
        Assert.IsNull(result);
    }
}
```

### 8.2 Integration Tests

**Test with Azure Functions Test Host:**

```csharp
[TestClass]
public class PipedriveApiIntegrationTests
{
    private TestServer testServer;
    private HttpClient httpClient;

    [TestInitialize]
    public void Setup()
    {
        // Initialize Azure Functions test host
        // Set up test verification_code in Azure Table Storage
        // Configure test Pipedrive API endpoint (mock or sandbox)
    }

    [TestMethod]
    public async Task EndToEnd_SearchCreateAttach_WorksCorrectly()
    {
        // 1. Search for person (should not exist)
        var searchResponse = await httpClient.GetAsync(
            "/api/pipedrive/persons/search?term=%2B48999999999&fields=phone",
            headers: new { Authorization = "Bearer test_code" }
        );
        var searchResult = await searchResponse.Content.ReadAsAsync<Person[]>();
        Assert.AreEqual(0, searchResult.Length);

        // 2. Create person
        var createResponse = await httpClient.PostAsJsonAsync(
            "/api/pipedrive/persons",
            new CreatePersonRequest
            {
                Name = "Test Person",
                Phone = "+48999999999",
                Email = "test@example.com"
            },
            headers: new { Authorization = "Bearer test_code" }
        );
        Assert.AreEqual(HttpStatusCode.Created, createResponse.StatusCode);
        var createdPerson = await createResponse.Content.ReadAsAsync<Person>();

        // 3. Search again (should find created person)
        searchResponse = await httpClient.GetAsync(
            "/api/pipedrive/persons/search?term=%2B48999999999&fields=phone",
            headers: new { Authorization = "Bearer test_code" }
        );
        searchResult = await searchResponse.Content.ReadAsAsync<Person[]>();
        Assert.AreEqual(1, searchResult.Length);
        Assert.AreEqual(createdPerson.Id, searchResult[0].Id);

        // 4. Attach additional phone
        var attachResponse = await httpClient.PostAsJsonAsync(
            $"/api/pipedrive/persons/{createdPerson.Id}/attach-phone",
            new AttachPhoneRequest { Phone = "+48888888888" },
            headers: new { Authorization = "Bearer test_code" }
        );
        Assert.AreEqual(HttpStatusCode.OK, attachResponse.StatusCode);
        var updatedPerson = await attachResponse.Content.ReadAsAsync<Person>();
        Assert.AreEqual(2, updatedPerson.Phones.Length);
    }

    [TestCleanup]
    public void Cleanup()
    {
        // Delete test person from Pipedrive sandbox
    }
}
```

### 8.3 Manual Testing Checklist

**Backend API Tests:**
- [ ] Search by phone returns correct person with full contact info
- [ ] Search by name returns multiple results with all phones
- [ ] Search returns empty array `[]` when no matches found (not 404)
- [ ] Create person adds phone with "WhatsApp" label and primary=false
- [ ] Create person with email stores email correctly
- [ ] Create person without email works (email field optional)
- [ ] Attach phone merges with existing phones correctly
- [ ] Attach phone preserves existing primary phone flag
- [ ] Attach phone with duplicate returns success (idempotent)
- [ ] Invalid verification_code returns 401
- [ ] Expired verification_code returns 401
- [ ] Backend handles Pipedrive rate limits (429)
- [ ] Backend handles Pipedrive API errors gracefully (500)
- [ ] Token refresh works when access_token expires
- [ ] Person not found returns 404 for attach endpoint
- [ ] CORS headers allow requests from web.whatsapp.com

**Pipedrive API Validation:**
- [ ] Phone saved with label "WhatsApp" visible in Pipedrive UI
- [ ] Phone marked as NOT primary in Pipedrive UI
- [ ] Email saved with label "work" and marked as primary
- [ ] Person appears in Pipedrive search after creation
- [ ] Attached phone appears in person's phone list

---

## 9. Acceptance Criteria (Spec-106a Complete)

### 9.1 Functional Requirements

- ✅ GET `/api/pipedrive/persons/search` endpoint implemented
- ✅ POST `/api/pipedrive/persons` endpoint implemented
- ✅ POST `/api/pipedrive/persons/{id}/attach-phone` endpoint implemented
- ✅ All endpoints require `verification_code` in Authorization header
- ✅ Backend validates session and retrieves Pipedrive tokens from Azure Table Storage
- ✅ Backend calls Pipedrive API with OAuth tokens
- ✅ Backend transforms Pipedrive responses to minimal Person format
- ✅ Backend adds phone with label "WhatsApp" and primary=false
- ✅ Attach phone endpoint fetches existing person and merges phones
- ✅ Attach phone handles duplicate detection (idempotent)
- ✅ HTTP status codes used correctly (200, 201, 401, 404, 429, 500)
- ✅ Token refresh logic implemented for expired tokens

### 9.2 Data Requirements

- ✅ Phone numbers stored in E.164 format
- ✅ Phone label set to "WhatsApp" for all operations
- ✅ Phone primary flag set to false (BRD requirement)
- ✅ Email is optional for create operation
- ✅ Existing phones preserved when attaching new phone
- ✅ Primary email extracted from Pipedrive emails array

### 9.3 Quality Requirements

- ✅ Unit tests pass with >80% code coverage
- ✅ Integration tests pass
- ✅ No hardcoded secrets or tokens
- ✅ Logging implemented for debugging
- ✅ Error handling covers all scenarios
- ✅ CORS configured correctly

### 9.4 Documentation Requirements

- ✅ API endpoints documented
- ✅ Request/response models documented
- ✅ Configuration documented
- ✅ Error scenarios documented

---

## 10. Out of Scope (Deferred)

The following are explicitly **NOT** part of Spec-106a:

- ❌ Extension implementation (covered in Spec-106b)
- ❌ UI components (Features 9-11)
- ❌ Caching layer (Post-MVP)
- ❌ Advanced error handling UI (Feature 12)
- ❌ Sentry error tracking (Feature 14)
- ❌ Rate limit retry logic (Post-MVP)
- ❌ Bulk operations (Post-MVP)
- ❌ Organization linking (Post-MVP)
- ❌ Deal operations (Post-MVP)

---

## 11. Implementation Notes

### 11.1 Pipedrive API Version

**Recommended: Use API v1 for persons:**
- More stable and well-documented
- v2 has incomplete documentation for persons endpoints
- Both versions support same phone/email structure

```csharp
// Use v1
var url = $"{pipedriveConfig.BaseUrl}/v1/persons/search";
```

### 11.2 OAuth Scope

**Required Pipedrive OAuth scope:**
- `contacts:full` - Required for read/write person operations
- Already configured in Spec-105a OAuth flow

### 11.3 CORS Configuration

**Azure Function CORS:**
```csharp
// Startup.cs or Function attribute
[EnableCors(origins: "https://web.whatsapp.com", methods: "GET,POST", headers: "*")]
```

### 11.4 Logging

**Comprehensive Logging:** All HTTP requests/responses and Pipedrive API calls are automatically logged via the `HttpRequestLogger` service. See [Spec-127-Comprehensive-Backend-Logging.md](Spec-127-Comprehensive-Backend-Logging.md) for complete logging architecture.

**Function Pattern:**
```csharp
[Function("PipedrivePersonsSearch")]
public async Task<HttpResponseData> Run(
    [HttpTrigger] HttpRequestData req,
    HttpRequestLogger httpRequestLogger)
{
    // Request logging (automatic)
    await httpRequestLogger.LogRequestAsync(req);

    // Function logic...
    var results = await searchPersons(term);

    // Response logging (required)
    var response = req.CreateResponse(HttpStatusCode.OK);
    await response.WriteAsJsonAsync(results);
    httpRequestLogger.LogResponse("PipedrivePersonsSearch", 200, results);

    return response;
}
```

**What's Logged:**
- All HTTP requests → Application Insights `customEvents` table
- All HTTP responses → Application Insights `traces` table
- All Pipedrive API calls → Application Insights `traces` table (via `PipedriveApiLogger`)
- No sampling - 100% of traffic captured

---

## 12. Next Steps

**After Spec-106a Completion:**

1. **Deploy to Azure:**
   - Deploy functions to same Azure Function App as OAuth service (Spec-105a)
   - Configure application settings in Azure portal
   - Test endpoints with Postman/curl

2. **Verify with Pipedrive Sandbox:**
   - Create test person via API
   - Verify in Pipedrive UI (phone label = "WhatsApp", primary = false)
   - Search for person by phone
   - Attach additional phone

3. **Begin Spec-106b:**
   - Extension service worker implementation
   - React hooks for Pipedrive operations
   - Message passing between content script and service worker

---

## 13. References

- [Pipedrive API Documentation](https://developers.pipedrive.com/docs/api/v1)
- [Pipedrive Persons API](https://developers.pipedrive.com/docs/api/v1/Persons)
- [OAuth 2.0 Token Refresh](https://www.oauth.com/oauth2-servers/access-tokens/refreshing-access-tokens/)
- [Azure Functions C# Developer Guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-dotnet-class-library)

---

**Status:** Draft - Ready for implementation
**Owner:** Backend team
**Estimated Effort:** 3-4 days (development + testing)
