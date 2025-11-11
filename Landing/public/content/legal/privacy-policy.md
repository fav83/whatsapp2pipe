# Privacy Policy

*Last updated: November 11, 2025*

Your privacy matters to us. This policy explains what data we collect, why we collect it, and your rights regarding your data. **We never sell your data.**

This policy applies to the chat2deal Chrome extension and website.

## What Data We Access

To provide our core functionality of syncing WhatsApp contacts with Pipedrive, the Chrome extension accesses the following data from WhatsApp Web. **This data is held temporarily in your browser's memory only and is never stored on our servers.**

**WhatsApp Data (Temporary Access Only)**:
- **Phone number**: Read from the active chat to find matching Pipedrive contacts
- **Contact name**: Read from the active chat to suggest when creating new contacts
- **Chat messages**: Only when you explicitly click "Extract Messages" to create notes in Pipedrive

**Important**: We only send this data to your Pipedrive account (which you already have access to). Phone numbers and contact names are held in your browser's memory for a few minutes, then automatically deleted. Chat messages are held for only 10 seconds during extraction, then deleted.

**What We Do NOT Access**:
- WhatsApp message history beyond the messages you explicitly select
- Media files or attachments
- Other WhatsApp chats
- Your WhatsApp contact list
- Any WhatsApp account credentials

## What We Collect and Store

We collect and store only what's necessary to operate the Service.

### User Profile Data

When you authenticate with Pipedrive via OAuth, we collect and store:
- **Pipedrive user ID**: To identify your account
- **Pipedrive company ID**: To associate you with your Pipedrive organization
- **Your name and email**: Retrieved from Pipedrive's user profile

**Retention**: Stored on our servers indefinitely while your account is active.

### Error and Performance Data

We use Sentry for error tracking and performance monitoring. When errors occur, Sentry collects:
- Error messages and stack traces
- Browser type and version
- Extension version
- Page URL (only WhatsApp Web, no message content)

We filter out personally identifiable information (phone numbers, names, tokens) from error reports before they're sent to Sentry.

### Session and Authentication Logs

We log authentication events (login, token refresh) with timestamps for security monitoring and troubleshooting. These logs are retained for 90 days.

### Website Analytics

On our marketing website, we use Simple Analytics (privacy-friendly analytics) to understand which pages are visited. We do not use Google Analytics, cookies, or tracking pixels. Simple Analytics collects only anonymized page view data.

## How We Share Your Information

We share information only when necessary to operate the Service or as required by law.

### Third-Party Services

**Pipedrive CRM** (your existing account):
- Phone numbers and contact names for person search and creation
- Formatted chat messages as note content (only when you click "Extract Messages")
- We never store Pipedrive data on our servers

**Sentry.io** (error tracking):
- Error messages and stack traces
- Browser type, extension version
- **PII automatically filtered**: Phone numbers, emails, names, and authentication tokens are redacted before sending

**Chat2Deal Backend** (our servers):
- Phone numbers (for Pipedrive lookup, not stored)
- Contact names (for Pipedrive person creation, not stored)
- Your feedback messages (if you choose to submit)
- Error reports (with PII filtered)

**Microsoft Azure** (hosting provider):
- All backend data is hosted on Azure infrastructure
- Subject to Microsoft's security and privacy policies

### Support Requests

If you contact us for support, we may need to access your authentication logs or error reports to help troubleshoot issues. We will not access your Pipedrive data without your explicit consent.

### Legal Requirements

We may disclose information if required by valid legal process (warrant, subpoena, court order). If legally permitted, we will notify affected users before disclosing data.

### Business Transfer

If chat2deal is acquired or merged with another company, we will notify you before your information is transferred or becomes subject to a different privacy policy.

## Your Data Rights

You have the following rights regarding your personal information:

- **Access**: You can request to see what data we have about you
- **Correction**: You can request corrections to your data (most profile data comes from Pipedrive)
- **Deletion**: You can request deletion of your data by emailing info@chat2deal.com
- **Portability**: You can request a copy of your data in a portable format
- **Objection**: You can object to certain data processing activities

To exercise these rights, email us at info@chat2deal.com. We may need to verify your identity before processing requests.

**Note**: Deleting your authentication data will prevent the Service from working. To stop using chat2deal, simply revoke OAuth access in Pipedrive or uninstall the extension.

## Data Security

We protect your data with industry-standard security measures:
- **Encryption in transit**: All data transmitted between your browser and our servers uses TLS/SSL encryption
- **Encryption at rest**: All stored data is encrypted at rest
- **Secure infrastructure**: Hosted on Microsoft Azure with automatic security updates

## Data Retention
- **User/company records**: Retained while your account is active
- **Authentication sessions**: 60 days, then automatically deleted
- **Authentication logs**: Retained for 90 days
- **Feedback messages**: Retained indefinitely for product improvement
- **Error reports**: Retained in Sentry for 30 days

**Account Deletion**:
When you disconnect the Service (revoke OAuth or uninstall), your session is deleted immediately. To request full deletion of all your data, email info@chat2deal.com.

## Data Location

All data is stored in Microsoft Azure data centers in the United States. By using the Service, you consent to data storage and processing in the U.S.

## Children's Privacy

chat2deal is not intended for children under 13. We do not knowingly collect information from children under 13. If we discover we have collected such information, we will delete it immediately.

## Policy Updates

We may update this policy to reflect new features or legal requirements. When we make significant changes, we'll update the date at the top and notify you via email if you have an authenticated session.

## Contact

Questions about this policy or your data? Email us at info@chat2deal.com.

---

*Adapted from [Basecamp policies](https://github.com/basecamp/policies) ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).*
