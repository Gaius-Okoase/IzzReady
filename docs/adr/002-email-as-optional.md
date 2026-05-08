# ADR 002 — Email as Optional

## Problem 
Not all users, particularly bukka owners, have or regularly check email addresses.

## Options considered
- Email as required for all users
- Email as optional with a sparse unique index.
- Remove email completely

## Decision
**Email optional with a sparse unique index**. Requiring email creates a barrier for users who may only have a phone number. A sparse index enforces uniqueness only when an email is provided, avoiding conflicts between multiple users with no email on record when querying.