# ADR 012 — Authentication Identifiers

## Problem

After resolving to use both Google OAuth and phone number auth methods, we have to find a way to store emails or phone numbers as unique yet optional based on user's choice.

## Options considered

- Make both fields unique
- Make both fields unique + sparse

## Decision

**Make both fields unique + sparse**. Making both fields unique prevents duplicate emails or phone number for identification, however with unique option alone, missing fields are assigned null and indexed, and because it's unique, no two documents can be allowed to be indexed with null. But with sparse, only documents containing the field will be indexed — those without are skipped and not assigned a value of null.
