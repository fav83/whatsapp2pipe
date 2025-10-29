using System.Text;
using System.Text.Json;
using AutoFixture;
using AutoFixture.Xunit2;
using Microsoft.Extensions.Logging;
using Moq;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Tests.Services;

public class OAuthStateValidatorTests
{
    private readonly Mock<ILogger<OAuthStateValidator>> mockLogger;
    private readonly OAuthStateValidator validator;
    private readonly Fixture fixture;

    public OAuthStateValidatorTests()
    {
        mockLogger = new Mock<ILogger<OAuthStateValidator>>();
        validator = new OAuthStateValidator(mockLogger.Object);
        fixture = new Fixture();
    }

    #region IsValidStateFormat Tests

    [Fact]
    public void IsValidStateFormat_ValidState_ReturnsTrue()
    {
        // Arrange
        var state = new OAuthState
        {
            ExtensionId = "abcdefghijklmnopabcdefghijklmnop", // 32 chars, a-p
            Nonce = fixture.Create<string>(),
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
        var encodedState = EncodeState(state);

        // Act
        var result = validator.IsValidStateFormat(encodedState);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsValidStateFormat_NullState_ReturnsFalse()
    {
        // Act
        var result = validator.IsValidStateFormat(null!);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValidStateFormat_EmptyState_ReturnsFalse()
    {
        // Act
        var result = validator.IsValidStateFormat(string.Empty);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValidStateFormat_MissingExtensionId_ReturnsFalse()
    {
        // Arrange
        var state = new OAuthState
        {
            ExtensionId = string.Empty,
            Nonce = fixture.Create<string>(),
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
        var encodedState = EncodeState(state);

        // Act
        var result = validator.IsValidStateFormat(encodedState);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValidStateFormat_MissingNonce_ReturnsFalse()
    {
        // Arrange
        var state = new OAuthState
        {
            ExtensionId = "abcdefghijklmnopabcdefghijklmnop",
            Nonce = string.Empty,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
        var encodedState = EncodeState(state);

        // Act
        var result = validator.IsValidStateFormat(encodedState);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValidStateFormat_MissingTimestamp_ReturnsFalse()
    {
        // Arrange
        var state = new OAuthState
        {
            ExtensionId = "abcdefghijklmnopabcdefghijklmnop",
            Nonce = fixture.Create<string>(),
            Timestamp = 0
        };
        var encodedState = EncodeState(state);

        // Act
        var result = validator.IsValidStateFormat(encodedState);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValidStateFormat_InvalidExtensionIdFormat_ReturnsFalse()
    {
        // Arrange
        var state = new OAuthState
        {
            ExtensionId = "invalid-extension-id",
            Nonce = fixture.Create<string>(),
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
        var encodedState = EncodeState(state);

        // Act
        var result = validator.IsValidStateFormat(encodedState);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValidStateFormat_ExpiredTimestamp_ReturnsFalse()
    {
        // Arrange
        var state = new OAuthState
        {
            ExtensionId = "abcdefghijklmnopabcdefghijklmnop",
            Nonce = fixture.Create<string>(),
            Timestamp = DateTimeOffset.UtcNow.AddMinutes(-10).ToUnixTimeMilliseconds()
        };
        var encodedState = EncodeState(state);

        // Act
        var result = validator.IsValidStateFormat(encodedState);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValidStateFormat_FutureTimestamp_ReturnsFalse()
    {
        // Arrange
        var state = new OAuthState
        {
            ExtensionId = "abcdefghijklmnopabcdefghijklmnop",
            Nonce = fixture.Create<string>(),
            Timestamp = DateTimeOffset.UtcNow.AddMinutes(10).ToUnixTimeMilliseconds()
        };
        var encodedState = EncodeState(state);

        // Act
        var result = validator.IsValidStateFormat(encodedState);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValidStateFormat_InvalidBase64_ReturnsFalse()
    {
        // Arrange
        var invalidBase64 = "not-valid-base64!!!";

        // Act
        var result = validator.IsValidStateFormat(invalidBase64);

        // Assert
        Assert.False(result);
    }

    #endregion

    #region DecodeState Tests

    [Fact]
    public void DecodeState_ValidBase64Json_ReturnsOAuthState()
    {
        // Arrange
        var expectedState = new OAuthState
        {
            ExtensionId = "abcdefghijklmnopabcdefghijklmnop",
            Nonce = fixture.Create<string>(),
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
        var encodedState = EncodeState(expectedState);

        // Act
        var result = validator.DecodeState(encodedState);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedState.ExtensionId, result.ExtensionId);
        Assert.Equal(expectedState.Nonce, result.Nonce);
        Assert.Equal(expectedState.Timestamp, result.Timestamp);
    }

    [Fact]
    public void DecodeState_InvalidBase64_ReturnsNull()
    {
        // Arrange
        var invalidBase64 = "not-valid-base64!!!";

        // Act
        var result = validator.DecodeState(invalidBase64);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void DecodeState_InvalidJson_ReturnsNull()
    {
        // Arrange
        var invalidJson = Convert.ToBase64String(Encoding.UTF8.GetBytes("{invalid-json}"));

        // Act
        var result = validator.DecodeState(invalidJson);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void DecodeState_EmptyString_ReturnsNull()
    {
        // Act
        var result = validator.DecodeState(string.Empty);

        // Assert
        Assert.Null(result);
    }

    #endregion

    #region IsValidExtensionId Tests

    [Theory]
    [InlineData("abcdefghijklmnopabcdefghijklmnop")] // All lowercase a-p
    [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")] // All 'a' (32 chars)
    [InlineData("pppppppppppppppppppppppppppppppp")] // All 'p'
    [InlineData("abcdefghijklmnopabcdefghijklmnoo")] // Mixed a-p
    public void IsValidExtensionId_ValidFormat_ReturnsTrue(string extensionId)
    {
        // Act
        var result = validator.IsValidExtensionId(extensionId);

        // Assert
        Assert.True(result);
    }

    [Theory]
    [InlineData("")] // Empty
    [InlineData("abcdefghijklmnopabcdefghijklmno")] // 31 chars (too short)
    [InlineData("abcdefghijklmnopabcdefghijklmnopq")] // 33 chars (too long)
    [InlineData("ABCDEFGHIJKLMNOPABCDEFGHIJKLMNOP")] // Uppercase
    [InlineData("abcdefghijklmnopabcdefghijklmnoz")] // Contains 'z' (invalid)
    [InlineData("abcdefghijklmnop12345678abcdefgh")] // Contains numbers
    [InlineData("abcdefghijklmnop-bcdefghijklmnop")] // Contains hyphen
    public void IsValidExtensionId_InvalidFormat_ReturnsFalse(string extensionId)
    {
        // Act
        var result = validator.IsValidExtensionId(extensionId);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsValidExtensionId_NullExtensionId_ReturnsFalse()
    {
        // Act
        var result = validator.IsValidExtensionId(null!);

        // Assert
        Assert.False(result);
    }

    #endregion

    #region IsStateTimestampValid Tests

    [Fact]
    public void IsStateTimestampValid_CurrentTimestamp_ReturnsTrue()
    {
        // Arrange
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // Act
        var result = validator.IsStateTimestampValid(timestamp);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsStateTimestampValid_RecentTimestamp_ReturnsTrue()
    {
        // Arrange
        var timestamp = DateTimeOffset.UtcNow.AddMinutes(-2).ToUnixTimeMilliseconds();

        // Act
        var result = validator.IsStateTimestampValid(timestamp);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsStateTimestampValid_WithinClockSkewTolerance_ReturnsTrue()
    {
        // Arrange - 30 seconds in the future (within 1 minute tolerance)
        var timestamp = DateTimeOffset.UtcNow.AddSeconds(30).ToUnixTimeMilliseconds();

        // Act
        var result = validator.IsStateTimestampValid(timestamp);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsStateTimestampValid_ExpiredState_ReturnsFalse()
    {
        // Arrange - 10 minutes old (exceeds 5 minute max)
        var timestamp = DateTimeOffset.UtcNow.AddMinutes(-10).ToUnixTimeMilliseconds();

        // Act
        var result = validator.IsStateTimestampValid(timestamp);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsStateTimestampValid_FutureTimestamp_ReturnsFalse()
    {
        // Arrange - 5 minutes in the future (exceeds 1 minute tolerance)
        var timestamp = DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeMilliseconds();

        // Act
        var result = validator.IsStateTimestampValid(timestamp);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsStateTimestampValid_NearBoundary_ReturnsTrue()
    {
        // Arrange - Just under 5 minutes old (within boundary with tolerance for execution time)
        var timestamp = DateTimeOffset.UtcNow.AddMinutes(-4.99).ToUnixTimeMilliseconds();

        // Act
        var result = validator.IsStateTimestampValid(timestamp);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsStateTimestampValid_InvalidTimestamp_ReturnsFalse()
    {
        // Arrange - Negative timestamp (invalid)
        var timestamp = -1L;

        // Act
        var result = validator.IsStateTimestampValid(timestamp);

        // Assert
        Assert.False(result);
    }

    #endregion

    #region Helper Methods

    private string EncodeState(OAuthState state)
    {
        var json = JsonSerializer.Serialize(state);
        var bytes = Encoding.UTF8.GetBytes(json);
        return Convert.ToBase64String(bytes);
    }

    #endregion
}
