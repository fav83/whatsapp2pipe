using AutoFixture;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Tests.Services;

public class PersonTransformServiceTests
{
    private readonly PersonTransformService service;
    private readonly Fixture fixture;

    public PersonTransformServiceTests()
    {
        service = new PersonTransformService();
        fixture = new Fixture();
    }

    #region TransformPerson Tests

    [Fact]
    public void TransformPerson_ValidPipedrivePerson_TransformsCorrectly()
    {
        // Arrange
        var pipedrivePerson = new PipedrivePerson
        {
            Id = 123,
            Name = "John Doe",
            Phone = new List<PipedrivePhone>
            {
                new PipedrivePhone { Value = "+48123456789", Label = "mobile", Primary = true },
                new PipedrivePhone { Value = "+48987654321", Label = "work", Primary = false }
            },
            Email = new List<PipedriveEmail>
            {
                new PipedriveEmail { Value = "john@example.com", Label = "work", Primary = true },
                new PipedriveEmail { Value = "john.doe@personal.com", Label = "personal", Primary = false }
            }
        };

        // Act
        var person = service.TransformPerson(pipedrivePerson);

        // Assert
        Assert.Equal(123, person.Id);
        Assert.Equal("John Doe", person.Name);
        Assert.Equal(2, person.Phones.Length);
        Assert.Equal("+48123456789", person.Phones[0].Value);
        Assert.Equal("mobile", person.Phones[0].Label);
        Assert.True(person.Phones[0].IsPrimary);
        Assert.Equal(2, person.Emails.Length);
        Assert.Equal("john@example.com", person.Emails[0].Value);
        Assert.Equal("work", person.Emails[0].Label);
        Assert.True(person.Emails[0].IsPrimary);
    }

    [Fact]
    public void TransformPerson_NoPhoneOrEmail_ReturnsEmptyArrays()
    {
        // Arrange
        var pipedrivePerson = new PipedrivePerson
        {
            Id = 456,
            Name = "Jane Smith",
            Phone = null,
            Email = null
        };

        // Act
        var person = service.TransformPerson(pipedrivePerson);

        // Assert
        Assert.Equal(456, person.Id);
        Assert.Equal("Jane Smith", person.Name);
        Assert.Empty(person.Phones);
        Assert.Empty(person.Emails);
    }

    [Fact]
    public void TransformPerson_EmptyPhoneAndEmailLists_ReturnsEmptyArrays()
    {
        // Arrange
        var pipedrivePerson = new PipedrivePerson
        {
            Id = 789,
            Name = "Bob Johnson",
            Phone = new List<PipedrivePhone>(),
            Email = new List<PipedriveEmail>()
        };

        // Act
        var person = service.TransformPerson(pipedrivePerson);

        // Assert
        Assert.Equal(789, person.Id);
        Assert.Equal("Bob Johnson", person.Name);
        Assert.Empty(person.Phones);
        Assert.Empty(person.Emails);
    }

    #endregion

    #region TransformPhones Tests

    [Fact]
    public void TransformPhones_ValidPhones_TransformsCorrectly()
    {
        // Arrange
        var pipedrivePhones = new List<PipedrivePhone>
        {
            new PipedrivePhone { Value = "+48123456789", Label = "mobile", Primary = true },
            new PipedrivePhone { Value = "+48987654321", Label = "work", Primary = false },
            new PipedrivePhone { Value = "+48555666777", Label = "WhatsApp", Primary = false }
        };

        // Act
        var phones = service.TransformPhones(pipedrivePhones);

        // Assert
        Assert.Equal(3, phones.Length);
        Assert.Equal("+48123456789", phones[0].Value);
        Assert.Equal("mobile", phones[0].Label);
        Assert.True(phones[0].IsPrimary);
        Assert.Equal("+48987654321", phones[1].Value);
        Assert.Equal("work", phones[1].Label);
        Assert.False(phones[1].IsPrimary);
        Assert.Equal("+48555666777", phones[2].Value);
        Assert.Equal("WhatsApp", phones[2].Label);
        Assert.False(phones[2].IsPrimary);
    }

    [Fact]
    public void TransformPhones_NullLabel_DefaultsToOther()
    {
        // Arrange
        var pipedrivePhones = new List<PipedrivePhone>
        {
            new PipedrivePhone { Value = "+48123456789", Label = null, Primary = true }
        };

        // Act
        var phones = service.TransformPhones(pipedrivePhones);

        // Assert
        Assert.Single(phones);
        Assert.Equal("+48123456789", phones[0].Value);
        Assert.Equal("other", phones[0].Label);
        Assert.True(phones[0].IsPrimary);
    }

    [Fact]
    public void TransformPhones_NullList_ReturnsEmptyArray()
    {
        // Act
        var phones = service.TransformPhones(null);

        // Assert
        Assert.NotNull(phones);
        Assert.Empty(phones);
    }

    [Fact]
    public void TransformPhones_EmptyList_ReturnsEmptyArray()
    {
        // Arrange
        var pipedrivePhones = new List<PipedrivePhone>();

        // Act
        var phones = service.TransformPhones(pipedrivePhones);

        // Assert
        Assert.NotNull(phones);
        Assert.Empty(phones);
    }

    [Fact]
    public void TransformPhones_SinglePhone_TransformsCorrectly()
    {
        // Arrange
        var pipedrivePhones = new List<PipedrivePhone>
        {
            new PipedrivePhone { Value = "+48123456789", Label = "mobile", Primary = true }
        };

        // Act
        var phones = service.TransformPhones(pipedrivePhones);

        // Assert
        Assert.Single(phones);
        Assert.Equal("+48123456789", phones[0].Value);
        Assert.Equal("mobile", phones[0].Label);
        Assert.True(phones[0].IsPrimary);
    }

    #endregion

    #region TransformEmails Tests

    [Fact]
    public void TransformEmails_ValidEmails_TransformsCorrectly()
    {
        // Arrange
        var pipedriveEmails = new List<PipedriveEmail>
        {
            new PipedriveEmail { Value = "john@work.com", Label = "work", Primary = true },
            new PipedriveEmail { Value = "john@personal.com", Label = "personal", Primary = false },
            new PipedriveEmail { Value = "john@home.com", Label = "home", Primary = false }
        };

        // Act
        var emails = service.TransformEmails(pipedriveEmails);

        // Assert
        Assert.Equal(3, emails.Length);
        Assert.Equal("john@work.com", emails[0].Value);
        Assert.Equal("work", emails[0].Label);
        Assert.True(emails[0].IsPrimary);
        Assert.Equal("john@personal.com", emails[1].Value);
        Assert.Equal("personal", emails[1].Label);
        Assert.False(emails[1].IsPrimary);
        Assert.Equal("john@home.com", emails[2].Value);
        Assert.Equal("home", emails[2].Label);
        Assert.False(emails[2].IsPrimary);
    }

    [Fact]
    public void TransformEmails_NullLabel_DefaultsToOther()
    {
        // Arrange
        var pipedriveEmails = new List<PipedriveEmail>
        {
            new PipedriveEmail { Value = "test@example.com", Label = null, Primary = true }
        };

        // Act
        var emails = service.TransformEmails(pipedriveEmails);

        // Assert
        Assert.Single(emails);
        Assert.Equal("test@example.com", emails[0].Value);
        Assert.Equal("other", emails[0].Label);
        Assert.True(emails[0].IsPrimary);
    }

    [Fact]
    public void TransformEmails_NullList_ReturnsEmptyArray()
    {
        // Act
        var emails = service.TransformEmails(null);

        // Assert
        Assert.NotNull(emails);
        Assert.Empty(emails);
    }

    [Fact]
    public void TransformEmails_EmptyList_ReturnsEmptyArray()
    {
        // Arrange
        var pipedriveEmails = new List<PipedriveEmail>();

        // Act
        var emails = service.TransformEmails(pipedriveEmails);

        // Assert
        Assert.NotNull(emails);
        Assert.Empty(emails);
    }

    [Fact]
    public void TransformEmails_SingleEmail_TransformsCorrectly()
    {
        // Arrange
        var pipedriveEmails = new List<PipedriveEmail>
        {
            new PipedriveEmail { Value = "test@example.com", Label = "work", Primary = true }
        };

        // Act
        var emails = service.TransformEmails(pipedriveEmails);

        // Assert
        Assert.Single(emails);
        Assert.Equal("test@example.com", emails[0].Value);
        Assert.Equal("work", emails[0].Label);
        Assert.True(emails[0].IsPrimary);
    }

    #endregion
}
