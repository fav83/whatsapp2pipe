# Release 1.1.280

**Deals Management**

- Create deals directly from WhatsApp conversations with inline form
- Change deal stage with backend API integration
- Mark deals as won or lost with optional lost reason
- Reopen closed deals with full state restoration
- Complete menu with consolidated won/lost actions in deal header
- Save WhatsApp messages to deal notes
- Improved deal pipeline and stage edit UX with hover-visible edit icons
- Keyboard navigation and ARIA accessibility for deal dropdowns
- Deal sorting now includes secondary sort by update time

**Feature Flags**

- Added feature flags system for gradual feature rollout
- Deals/pipelines API calls are now guarded by enableDeals feature flag

**Bug Fixes**

- Fixed config race condition and improved 404 error handling
- Fixed pre-commit hook to only run for Extension files

# Release 1.0.241

**Stability & Reliability Improvements**

- Fixed race condition when rapidly switching between WhatsApp contacts that could cause incorrect person data to display
- Improved database reliability with automatic retry logic for Azure SQL transient failures
- Enhanced transaction handling to work properly with SQL retry strategy
- Updated extension environment configuration and added demo resources

# Release 1.0.229