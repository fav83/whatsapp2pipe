using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
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

        // Configure logging to ensure all ILogger output reaches Application Insights
        services.Configure<LoggerFilterOptions>(options =>
        {
            // Remove default filter that might suppress logs
            var defaultRule = options.Rules.FirstOrDefault(rule =>
                rule.ProviderName == "Microsoft.Extensions.Logging.ApplicationInsights.ApplicationInsightsLoggerProvider");
            if (defaultRule != null)
            {
                options.Rules.Remove(defaultRule);
            }
        });

        // Register OAuth services
        services.AddSingleton<IOAuthService, OAuthService>();
        services.AddSingleton<OAuthStateValidator>();

        // Add DbContext and DbContextFactory with SQL Server
        // - DbContextFactory: For singleton services (SqlSessionService)
        // - DbContext: For scoped services (UserService)
        var connectionString = context.Configuration.GetConnectionString("Chat2DealDb");

        services.AddDbContextFactory<Chat2DealDbContext>(options =>
            options.UseSqlServer(connectionString, sqlOptions =>
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null)));

        services.AddDbContext<Chat2DealDbContext>(options =>
            options.UseSqlServer(connectionString, sqlOptions =>
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null)));

        // Register session service as Singleton (uses DbContextFactory per-call)
        services.AddSingleton<ISessionService, SqlSessionService>();

        // Register UserService as Scoped (uses DbContext directly)
        services.AddScoped<IUserService, UserService>();

        // Register HTTP request logger
        services.AddScoped<HttpRequestLogger>();

        // Register Pipedrive configuration
        services.AddSingleton(sp =>
        {
            var configuration = sp.GetRequiredService<IConfiguration>();
            var settings = new PipedriveSettings();

            // Bind all Pipedrive settings from configuration section
            configuration.GetSection("Pipedrive").Bind(settings);

            return settings;
        });

        // Register Pipedrive services
        services.AddHttpClient<IPipedriveApiClient, PipedriveApiClient>();
        services.AddSingleton<PersonTransformService>();
        services.AddSingleton<DealTransformService>();
    })
    .Build();

host.Run();
