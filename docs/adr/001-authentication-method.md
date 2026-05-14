# ADR 001 — Authentication Methods

## Problem
Not all users, particularly bukka owners, have or regularly check email addresses. Additionally, not all users, particularly tech comfortable customers, prefer using a phone number. Which way should be the best for authenticating user?


## Options considered
- Email required, phone number optional
- Phone number required with OTP verification, email optional
- Both required
- Both optional 


## Decision
**Both optional**. OTP, despite being the best option, was dropped for the pilot/MVP due to cost. The password based authentication covers users without Google accounts while Google OAuth covers users who prefer not to manage passwords and are cool with that flow. Making both optional accommodates all user types without compromising uniqueness — sparse unique indexes enforce uniqueness only when a value is provided, avoiding conflicts between documents where the field is absent.