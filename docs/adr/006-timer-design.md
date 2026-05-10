# Architecture Decision Record (ADR) 006 — Timer Design

## Problem
When a bukka owner sets a countdown timer for a food item, something needs to detect when that timer expires and trigger a confirmation prompt.


## Options considered
- setTimeout in server memory
- A background job scheduler with node-cron.

## Decision 
**Node-cron**. setTimeout lives in server memory and dies on restart. In case of a server restarting or crashing silently, all active timers are lost. Also, should the app grow and there's need for more than 2 to 3 servers, there's no way to keep track of the timers. Node-cron runs on a schedule independent of user requests, and since the expiry timestamp (timer) is stored in MongoDB, any timers that expired during a restart are caught on the next scheduled check.