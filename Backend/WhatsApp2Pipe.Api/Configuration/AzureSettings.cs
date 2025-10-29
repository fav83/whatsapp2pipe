namespace WhatsApp2Pipe.Api.Configuration;

public class AzureSettings
{
    public string StorageConnectionString { get; set; } = string.Empty;
    public string SessionTableName { get; set; } = "sessions";
    public string StateTableName { get; set; } = "states";
    public int SessionExpirationDays { get; set; } = 60;
    public int StateExpirationMinutes { get; set; } = 5;
}
