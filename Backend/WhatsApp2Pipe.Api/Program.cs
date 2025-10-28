using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WhatsApp2Pipe.Api.Configuration;
using WhatsApp2Pipe.Api.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
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
            var baseUrl = Environment.GetEnvironmentVariable("PipedriveApiBaseUrl") ?? "https://api.pipedrive.com";
            var apiVersion = Environment.GetEnvironmentVariable("PipedriveApiVersion") ?? "v1";
            return new PipedriveConfig
            {
                BaseUrl = baseUrl,
                ApiVersion = apiVersion
            };
        });

        // Register Pipedrive services
        services.AddHttpClient<IPipedriveApiClient, PipedriveApiClient>();
        services.AddSingleton<PersonTransformService>();
    })
    .Build();

host.Run();
