# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Chronica, please report it responsibly:

1. **DO NOT** open a public issue
2. Email security concerns to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies by severity (critical: 7 days, high: 30 days, medium: 90 days)

## Security Considerations

Chronica is a desktop application that:

- **Stores data locally** in the user's AppData directory
- **No network requests** except for update checks (future)
- **No telemetry** or analytics
- **Sandboxed** by Tauri security model

### Data Storage

- All board data saved in: `%AppData%/Chronica` (Windows)
- Files are plain JSON (not encrypted)
- Users should secure their file system appropriately

### Import/Export

- Imported JSON is validated with Zod schemas
- Sanitization applied to user input (DOMPurify)
- Custom field regex patterns validated for ReDoS risks

## Best Practices for Contributors

- Never commit secrets or API keys
- Sanitize all user inputs
- Validate data from external sources
- Keep dependencies updated (automated via Renovate)
