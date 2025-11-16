# Release 1.0.241

**Stability & Reliability Improvements**

- Fixed race condition when rapidly switching between WhatsApp contacts that could cause incorrect person data to display
- Improved database reliability with automatic retry logic for Azure SQL transient failures
- Enhanced transaction handling to work properly with SQL retry strategy
- Updated extension environment configuration and added demo resources

# Release 1.0.229