using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;
using Microsoft.Data.SqlClient;

namespace WhatsApp2Pipe.Api.Functions;

public class WaitlistFunction
{
    private readonly ILogger<WaitlistFunction> logger;
    private readonly Chat2DealDbContext dbContext;
    private readonly HttpRequestLogger httpRequestLogger;

    // Basic email regex pattern
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public WaitlistFunction(
        ILogger<WaitlistFunction> logger,
        Chat2DealDbContext dbContext,
        HttpRequestLogger httpRequestLogger)
    {
        this.logger = logger;
        this.dbContext = dbContext;
        this.httpRequestLogger = httpRequestLogger;
    }

    [Function("Waitlist")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "waitlist")]
        HttpRequestData req)
    {
        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("Waitlist signup request received");

        try
        {
            // Parse request body
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(requestBody))
            {
                return await CreateErrorResponse(req, "Request body is required");
            }

            WaitlistSignupRequest? signupRequest;
            try
            {
                signupRequest = JsonSerializer.Deserialize<WaitlistSignupRequest>(
                    requestBody,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (JsonException)
            {
                return await CreateErrorResponse(req, "Invalid JSON payload");
            }

            if (signupRequest == null)
            {
                return await CreateErrorResponse(req, "Invalid request format");
            }

            // Validate email
            if (string.IsNullOrWhiteSpace(signupRequest.Email))
            {
                return await CreateErrorResponse(req, "Email is required");
            }

            var email = signupRequest.Email.Trim().ToLowerInvariant();

            // Validate max length (matches DB constraint)
            if (email.Length > 255)
            {
                return await CreateErrorResponse(req, "Email must be 255 characters or fewer");
            }

            if (!EmailRegex.IsMatch(email))
            {
                return await CreateErrorResponse(req, "Invalid email address");
            }

            // Check if email already exists
            var existingEntry = await dbContext.WaitlistEntries
                .FirstOrDefaultAsync(w => w.Email == email);

            if (existingEntry != null)
            {
                // Update existing entry
                logger.LogInformation("Updating existing waitlist entry for {Email}", email);

                existingEntry.UpdatedAt = DateTime.UtcNow;

                // Update name if provided and different
                if (!string.IsNullOrWhiteSpace(signupRequest.Name))
                {
                    existingEntry.Name = signupRequest.Name.Trim();
                }

                await dbContext.SaveChangesAsync();

                logger.LogInformation("Waitlist entry updated for {Email}", email);
            }
            else
            {
                // Create new entry
                logger.LogInformation("Creating new waitlist entry for {Email}", email);

                var newEntry = new WaitlistEntry
                {
                    WaitlistId = Guid.NewGuid(),
                    Email = email,
                    Name = string.IsNullOrWhiteSpace(signupRequest.Name)
                        ? null
                        : signupRequest.Name.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                dbContext.WaitlistEntries.Add(newEntry);
                try
                {
                    await dbContext.SaveChangesAsync();
                }
                catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx && (sqlEx.Number == 2601 || sqlEx.Number == 2627))
                {
                    // Unique constraint violation on Email – fall back to update existing
                    logger.LogInformation("Detected duplicate waitlist entry for {Email} during insert, updating instead", email);

                    var duplicate = await dbContext.WaitlistEntries.FirstOrDefaultAsync(w => w.Email == email);
                    if (duplicate != null)
                    {
                        duplicate.UpdatedAt = DateTime.UtcNow;
                        if (!string.IsNullOrWhiteSpace(signupRequest.Name))
                        {
                            duplicate.Name = signupRequest.Name.Trim();
                        }
                        await dbContext.SaveChangesAsync();
                    }
                }

                logger.LogInformation("Waitlist entry created with ID {WaitlistId}", newEntry.WaitlistId);
            }

            // Return success response (same for both new and duplicate)
            return await CreateSuccessResponse(req);
        }
        catch (JsonException)
        {
            return await CreateErrorResponse(req, "Invalid JSON payload");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing waitlist signup");
            return await CreateErrorResponse(req, "An internal error occurred. Please try again.", HttpStatusCode.InternalServerError);
        }
    }

    private async Task<HttpResponseData> CreateSuccessResponse(HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        var responseBody = new
        {
            success = true,
            message = "You're on the waitlist! We'll email you when access is available."
        };
        await response.WriteAsJsonAsync(responseBody);
        httpRequestLogger.LogResponse("Waitlist", (int)HttpStatusCode.OK, responseBody);
        return response;
    }

    private async Task<HttpResponseData> CreateErrorResponse(HttpRequestData req, string error, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
    {
        var response = req.CreateResponse(statusCode);
        var errorBody = new
        {
            success = false,
            error
        };
        await response.WriteAsJsonAsync(errorBody);
        httpRequestLogger.LogResponse("Waitlist", (int)statusCode, errorBody);
        return response;
    }
}
