---
name: react-native-quality-performance
description: "Review React Native changes for rendering efficiency, lifecycle safety, list performance, resource cleanup, asynchronous behavior, and mobile performance regressions."
---

# React Native Quality and Performance

## Review Rendering

Check:

* unnecessary re-renders
* expensive render-time work
* duplicated state
* unnecessary derived state
* unstable props when materially harmful

## Review Effects

Check:

* effect dependencies
* effect cleanup
* subscriptions
* listeners
* timers
* async lifecycle behavior

## Review Lists

For large lists check:

* stable keys
* virtualization
* pagination
* expensive row rendering
* unnecessary item re-renders

Follow the repository's existing list strategy.

## Review Resource Usage

Check for:

* leaked listeners
* leaked timers
* duplicate requests
* abandoned async work
* unnecessary resource usage

## Avoid Speculative Optimization

Do not add memoization or performance abstractions without clear justification.
