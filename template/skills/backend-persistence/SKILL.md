---
name: backend-persistence
description: Implement Node.js persistence changes against the repository's existing database, ORM, ODM, query, repository, and transaction patterns while preserving data integrity and compatibility.
---

# Backend Persistence

## Discover the Persistence Stack

Inspect repository evidence to determine:

- database technology
- ORM, ODM, query builder, or native driver
- schema/model definitions
- repository/data-access conventions
- migration mechanism
- transaction mechanism
- test strategy

Do not assume PostgreSQL, MongoDB, Prisma, Mongoose, TypeORM,
Sequelize, or another technology.

## Understand the Existing Model

Before modifying persistence determine:

- authoritative data
- ownership
- relationships
- constraints
- indexes
- lifecycle
- relevant existing data

Do not create duplicate sources of truth without approved
architecture.

## Preserve Data Invariants

Identify invariants required by requirements and design.

Where relevant consider enforcing invariants through:

- database constraints
- atomic operations
- transactions
- conditional updates
- versioning
- application validation

Choose mechanisms consistent with the approved design and
existing persistence technology.

## Transactions

When multiple state changes must succeed or fail together,
identify the required transaction boundary.

Do not assume multiple database operations are atomic.

Consider external side effects separately from database
transactions.

## Concurrent Writes

For mutable shared state ask:

- Can two requests read the same old state?
- Can both writes succeed?
- Can a value be granted twice?
- Can updates overwrite one another?
- Does retry duplicate data?

Use the concurrency strategy defined by the Technical Design.

## Queries

When modifying queries:

- preserve correctness first
- inspect existing indexes when performance matters
- avoid unnecessary repeated queries
- avoid unbounded reads when data may grow
- preserve tenant/ownership filtering

Do not optimize speculatively without evidence.

## Schema Changes

If schema changes are required:

- use the project's migration mechanism
- preserve migration ordering
- consider existing data
- consider old/new application compatibility
- avoid destructive migration unless explicitly approved

Do not silently create manual production migration steps.

## Persistence Tests

When relevant test:

- normal reads/writes
- constraints
- duplicate operations
- transactions
- rollback
- concurrency
- existing-data compatibility

Prefer integration testing for behavior dependent on actual
database semantics.