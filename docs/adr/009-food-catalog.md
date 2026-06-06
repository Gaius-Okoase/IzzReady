# Architecture Decision Record (ADR) 009 — Food Catalog

## Problem

Bukka owners, particularly those who are not tech savvy, need a simple way to add
food items to their menu without typing. Typing introduces friction — spelling errors,
inconsistent naming across the platform, and a poor experience for the target audience.

## Options considered

- Free text input where owners type food item names manually
- Autocomplete suggestions based on previously entered food names
- A predefined visual food catalog with images and names that owners pick from

## Decision

**A predefined visual food catalog**. Free text input requires owners to spell correctly
and type on a small screen — a significant barrier for the target audience. Autocomplete
only becomes useful after enough data exists, making it a post-MVP feature. A visual
catalog lets owners identify food by image rather than name, removing the literacy and
spelling barrier entirely. Owners browse by category or search, tap what they recognise,
and confirm. Custom items are supported via an "add yours" flow where the owner provides
a name and optional image — these are marked with `isCustom: true` and scoped to their
bukka only, not added to the global catalog without review.
