# ADR 006 — Notification Payload Strategy

---

## Problem

When sending web push notifications to queued customers after a bukka owner confirms food is ready, the notification body needs the food item name and bukka name. These values are not stored on the queue entry document and I don't want to add them to not break normalization in my schema design. A decision was needed on how to retrieve them efficiently.

---

## Options considered

— Query food item and bukka separately at the start of the confirmation flow, then populate only pushNotifToken from queue entries. Food name and bukka name are fetched once and reused for every notification in that batch.
— Populate the entire chain from queue entries in one operation — user for pushNotifToken, food item for name and bukkaId, bukka for name. Mongoose handles the joins automatically.

---

## Decision

**Query food item and bukka separately.** The second option appears more elegant but is less efficient. Mongoose fetches the food item and bukka document once per queue entry, not once total. With 20 people in a queue that means 20 redundant fetches of the same two documents. Option 1 fetches food item and bukka exactly once regardless of queue size, reuses those values across all notifications, and keeps the queue entry populate simple — one collection, one field.