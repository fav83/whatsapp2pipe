using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Middleware;
using WhatsApp2Pipe.Api.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults(builder =>
    {
        builder.UseMiddleware<CorsMiddleware>();
    })
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // Register OAuth services
        services.AddSingleton<ITableStorageService, TableStorageService>();
        services.AddSingleton<IOAuthService, OAuthService>();
        services.AddSingleton<OAuthStateValidator>();

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
