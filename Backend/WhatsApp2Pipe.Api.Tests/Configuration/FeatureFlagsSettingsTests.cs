using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using WhatsApp2Pipe.Api.Configuration;

namespace WhatsApp2Pipe.Api.Tests.Configuration;

public class FeatureFlagsSettingsTests
{
    [Fact]
    public void FeatureFlagsSettings_DefaultValues_EnableDealsIsFalse()
    {
        // Arrange & Act
        var settings = new FeatureFlagsSettings();

        // Assert - defaults to false (opt-in)
        Assert.False(settings.EnableDeals);
    }

    [Fact]
    public void FeatureFlagsSettings_BindFromConfiguration_EnableDealsTrue()
    {
        // Arrange
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["FeatureFlags:EnableDeals"] = "true"
            })
            .Build();

        var services = new ServiceCollection();
        services.Configure<FeatureFlagsSettings>(configuration.GetSection("FeatureFlags"));
        var serviceProvider = services.BuildServiceProvider();

        // Act
        var settings = serviceProvider.GetRequiredService<IOptions<FeatureFlagsSettings>>().Value;

        // Assert
        Assert.True(settings.EnableDeals);
    }

    [Fact]
    public void FeatureFlagsSettings_BindFromConfiguration_EnableDealsFalse()
    {
        // Arrange
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["FeatureFlags:EnableDeals"] = "false"
            })
            .Build();

        var services = new ServiceCollection();
        services.Configure<FeatureFlagsSettings>(configuration.GetSection("FeatureFlags"));
        var serviceProvider = services.BuildServiceProvider();

        // Act
        var settings = serviceProvider.GetRequiredService<IOptions<FeatureFlagsSettings>>().Value;

        // Assert
        Assert.False(settings.EnableDeals);
    }

    [Fact]
    public void FeatureFlagsSettings_MissingConfiguration_UsesDefaultValue()
    {
        // Arrange - empty configuration
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var services = new ServiceCollection();
        services.Configure<FeatureFlagsSettings>(configuration.GetSection("FeatureFlags"));
        var serviceProvider = services.BuildServiceProvider();

        // Act
        var settings = serviceProvider.GetRequiredService<IOptions<FeatureFlagsSettings>>().Value;

        // Assert - should use default value (false - opt-in)
        Assert.False(settings.EnableDeals);
    }

    [Fact]
    public void FeatureFlagsSettings_DoubleUnderscoreNotation_BindsCorrectly()
    {
        // Arrange - simulates Azure App Settings format
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["FeatureFlags__EnableDeals"] = "false"
            })
            .Build();

        var services = new ServiceCollection();
        services.Configure<FeatureFlagsSettings>(configuration.GetSection("FeatureFlags"));
        var serviceProvider = services.BuildServiceProvider();

        // Act
        var settings = serviceProvider.GetRequiredService<IOptions<FeatureFlagsSettings>>().Value;

        // Assert
        Assert.False(settings.EnableDeals);
    }
}
