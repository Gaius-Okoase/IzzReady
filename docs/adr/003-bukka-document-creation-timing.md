# ADR 003 — Bukka Document Creation Timing

## Problem
Google OAuth users skip the registration form entirely, so the system cannot rely on the form to collect phone number, bukka name and location for all owners. A bukka owner needs a bukka document with details such as name and location created in the system. The question is when — during registration or after. Simplicity is the aim.

## Options considered
- Creating the bukka document during sign up alongside the user document
- Creating it after sign up during a profile completion step.

## Decision
**Profile completion step**.  Creating the bukka document at profile completion makes the flow consistent regardless of how the owner registered.