using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Middleware;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults(builder =>
    {
        builder.UseMiddleware<CorsMiddleware>();
    })
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // Register OAuth services
        services.AddSingleton<IOAuthService, OAuthService>();
        services.AddSingleton<OAuthStateValidator>();

        // Add DbContext and DbContextFactory with SQL Server
        // - DbContextFactory: For singleton services (SqlSessionService)
        // - DbContext: For scoped services (UserService)
        var connectionString = context.Configuration.GetConnectionString("Chat2DealDb");

        services.AddDbContextFactory<Chat2DealDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddDbContext<Chat2DealDbContext>(options =>
            options.UseSqlServer(connectionString));

        // Register session service as Singleton (uses DbContextFactory per-call)
        services.AddSingleton<ISessionService, SqlSessionService>();

        // Register UserService as Scoped (uses DbContext directly)
        services.AddScoped<IUserService, UserService>();

        // Register Pipedrive configuration
        services.AddSingleton(sp =>
        {
            var configuration = sp.GetRequiredService<IConfiguration>();
            var settings = new PipedriveSettings();

            // Bind OAuth settings from configuration section
            configuration.GetSection("Pipedrive").Bind(settings);

            // Override API settings from environment variables if provided
            var baseUrl = Environment.GetEnvironmentVariable("PipedriveApiBaseUrl");
            var apiVersion = Environment.GetEnvironmentVariable("PipedriveApiVersion");

            if (!string.IsNullOrEmpty(baseUrl))
            {
                settings.BaseUrl = baseUrl;
            }

            if (!string.IsNullOrEmpty(apiVersion))
            {
                settings.ApiVersion = apiVersion;
            }

            return settings;
        });

        // Register Pipedrive services
        services.AddHttpClient<IPipedriveApiClient, PipedriveApiClient>();
        services.AddSingleton<PersonTransformService>();
    })
    .Build();

host.Run();
