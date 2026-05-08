# ADR 004 — Role as a Superset

## Problem
A user can be both a customer and a bukka owner. The system needs to handle permissions for both without forcing separate accounts.

## Options considered
- Role as an array holding multiple values.
- Role as a single string where `owner` inherits all `customer` permissions.

## Decision
**Role as a single string with `owner` as a superset of `customer`**. An array adds complexity to authorization checks throughout the codebase. Treating `owner` as a superset means the middleware simply checks — if you are an `owner`, you have everything a `customer` has plus more. Simpler to implement and easier to reason about.