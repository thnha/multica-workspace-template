---
name: regression-testing
description: Perform targeted regression validation around changed components, dependent flows, and previously working behavior that could be affected by the implementation.
---

# Regression Testing

Identify existing behavior that may be affected by the change.

Focus on:

* directly modified components
* shared modules
* dependent workflows
* API contracts
* persisted state
* authentication and authorization
* navigation or lifecycle behavior
* integrations

Select regression scenarios based on actual impact.

Do not run unrelated regression tests without a clear dependency or risk.

Report any behavior that changed unexpectedly.
