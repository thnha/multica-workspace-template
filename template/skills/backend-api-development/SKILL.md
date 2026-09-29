---
name: backend-api-development
description: Implement or modify backend API operations in an existing Node.js service while preserving established routing, validation, authentication, authorization, service boundaries, error contracts, and compatibility.
---

# Backend API Development

## Inspect Existing Contracts

Before implementation inspect similar existing operations.

Determine project conventions for:

- routing
- controllers or handlers
- request validation
- authentication
- authorization
- DTOs or schemas
- response serialization
- error responses
- pagination when relevant
- API versioning
- tests

Follow the established contract style.

## Trace the Request

Understand the complete relevant flow.

Typical example:

Request
→ middleware
→ authentication
→ validation
→ handler
→ application/domain service
→ persistence/integration
→ response mapping

Use the actual repository architecture.

## Validate at Trust Boundaries

Validate externally controlled data at the appropriate boundary.

Consider relevant:

- body
- path parameters
- query parameters
- headers
- identifiers
- enum values
- ranges
- lengths

Do not duplicate validation unnecessarily across layers.

## Authentication and Authorization

Keep these separate.

Authentication determines identity.

Authorization determines whether that identity may perform the
operation.

When relevant verify:

- permissions
- roles
- resource ownership
- tenant/workspace boundaries

Do not trust resource ownership supplied by the client.

## Business Logic

Keep transport-specific handling separate from domain or
application behavior according to existing project conventions.

Do not place substantial business logic in route handlers when
the project already uses a service/domain boundary.

## Errors

Preserve the project's error contract.

Differentiate relevant cases such as:

- malformed input
- unauthenticated
- unauthorized
- missing resource
- business rule violation
- conflict
- unexpected internal failure

Do not expose stack traces or sensitive internals.

## Compatibility

For existing operations, inspect consumers when relevant.

Avoid breaking:

- request shape
- response shape
- status/error semantics
- required fields

unless the approved design explicitly requires the change.

## Tests

Validate behavior at the appropriate level.

Cover relevant:

- successful request
- invalid input
- authentication
- authorization
- business rule failure
- persistence/integration behavior
- contract compatibility

Avoid testing framework internals instead of application
behavior.