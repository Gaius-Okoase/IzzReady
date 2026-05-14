# ADR 005 — Queue as a Collection

## Problem
When a customer joins a queue for a food item, that relationship needs to be stored somewhere to be managed succesfully.

## Options considered
- Storing an array of customer IDs inside the food item document
- Separate queue_entries collection.

## Decision
**Separate queue_entries collection.** Embedding customer IDs inside the food item document creates a race condition when multiple customers join simultaneously — concurrent writes fight over the same array. Individual queue entry documents are isolated inserts that don't conflict with each other. Counting documents is also safer and more accurate than maintaining a running total.