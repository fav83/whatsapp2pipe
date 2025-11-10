using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

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
            OrganizationName = pipedrivePerson.OrganizationName,
            Phones = TransformPhones(pipedrivePerson.Phone),
            Emails = TransformEmails(pipedrivePerson.Email)
        };
    }

    /// <summary>
    /// Transform Pipedrive phone array to our Phone array
    /// </summary>
    public Phone[] TransformPhones(List<PipedrivePhone>? pipedrivePhones)
    {
        if (pipedrivePhones == null || pipedrivePhones.Count == 0)
            return Array.Empty<Phone>();

        return pipedrivePhones.Select(p => new Phone
        {
            Value = p.Value,
            Label = p.Label ?? "other",
            IsPrimary = p.Primary
        }).ToArray();
    }

    /// <summary>
    /// Transform Pipedrive email array to our Email array
    /// </summary>
    public Models.Email[] TransformEmails(List<PipedriveEmail>? pipedriveEmails)
    {
        if (pipedriveEmails == null || pipedriveEmails.Count == 0)
            return Array.Empty<Models.Email>();

        return pipedriveEmails.Select(e => new Models.Email
        {
            Value = e.Value,
            Label = e.Label ?? "other",
            IsPrimary = e.Primary
        }).ToArray();
    }
}
