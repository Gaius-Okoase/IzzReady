# ADR 001 — Authentication Methods

## Problem
The platform serves two very different user types — tech comfortable users and users who aren't tech savy.


## Options considered
- OTP only for everyon
- Phone number and password only 
- Google OAuth plus phone number and password.


## Decision
**Google OAuth plus phone number and password**. OTP was dropped for the pilot due to cost and complexity. The password based authentication covers users without Google accounts while Google OAuth covers users who prefer not to manage passwords and are cool with that flow. Both paths feed into the same profile completion flow, keeping the post-registration experience consistent. To prevent users who aren't tech comfortable and sign up with phone number and password, tokens will have long expiry time.