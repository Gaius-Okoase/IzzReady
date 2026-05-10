# Data Model Documentation

---

## Overview
IzzReady's data model consists of four entities: **users**, **bukkas**, **food_items**, and **queue_entries**. 
The model is *normalized*, meaning each piece of information is stored once and referenced by ID everywhere else it is needed.

---

## Core Entities in DBML
```
Table users {
  id string [pk]
  googleId string
  name string
  email string [unique]
  phoneNumber string [unique]
  password string
  role string
  isProfileComplete boolean
  pushNotifToken string
  createdAt timestamp
  updatedAt timestamp
}

Table bukkas {
  id string [pk]
  userId string [ref: > users.id]
  name string
  location Geojson 
  createdAt timestamp
  updatedAt timestamp
}

Table food_items {
  id string [pk]
  bukkaId string [ref: > bukkas.id]
  name string
  status string  // enum: unavailable, coming_soon, awaiting_confirmation, izz_ready
  timer timestamp
  createdAt timestamp
  updatedAt timestamp
}

Table queue_entries {
  id string [pk]
  userId string [ref: > users.id]
  foodItemId string [ref: > food_items.id]
  createdAt timestamp
  updatedAt timestamp
}
```

---

## Relationships

**User → Bukka**
- One-to-Many
- A user can own multiple bukkas

**Bukka → FoodItem**
- One-to-Many
- A bukka has many food items

**User → Queue_Entries**
- One-to-Many
- A user can create multiple queue entries for different food items

**FoodItem → QueueEntry**
- One-to-Many
- A food item can have multiple people in queue

---

## ERD 

![IzzReady-ERD](/docs/images/IzzReady_ERD.png)