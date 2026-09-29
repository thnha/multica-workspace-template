---
name: native-platform-integration
description: "Implement React Native changes involving iOS, Android, native modules, permissions, device capabilities, lifecycle behavior, and native build configuration."
---

# Native Platform Integration

## Determine Platform Impact

Identify whether the change affects:

* iOS
* Android
* both platforms
* JavaScript or TypeScript only
* native project files

## Inspect Native Configuration

When relevant inspect:

* Info.plist
* AndroidManifest.xml
* Gradle configuration
* Xcode configuration
* permissions
* native modules
* deep links
* push notifications
* device capabilities

## Preserve Platform Compatibility

Check platform-specific behavior before assuming shared behavior is identical.

Keep platform-specific logic isolated where practical.

Prefer existing native abstractions.

## Limit Native Changes

Do not:

* modify native configuration without need
* add native dependencies without justification
* change unrelated platform settings

## Validate Platform Behavior

Verify affected platform behavior and document any validation limitations.
