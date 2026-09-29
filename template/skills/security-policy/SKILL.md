# Security Policy

## Principle

Security boundaries must not be weakened without explicit
approved requirements.

## Always Consider When Relevant

- authentication
- authorization
- ownership
- input validation
- secrets
- sensitive data
- injection
- privilege escalation
- replay
- duplicate operations
- rate abuse
- client trust
- logging exposure

## Trust Boundaries

Client-provided data must not automatically be considered
trusted.

Security-sensitive decisions should be enforced by trusted
components.

## Secrets

Never:

- hardcode secrets
- expose credentials
- commit tokens
- print sensitive secrets in logs or reports

## Authorization

Authentication does not imply authorization.

Verify resource ownership and permissions where applicable.

## Security Uncertainty

Potential security regressions that cannot be confidently
evaluated must be escalated rather than silently accepted.