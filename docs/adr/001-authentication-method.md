# ADR 001 — Authentication Methods

## Problem
The platform serves two very different user types — tech comfortable users and users who aren't tech savy. How do we authenticate bukka owners who aren't tech savy in the simplest way possible?


## Options considered
- OTP only for everyone
- Phone number and password only 
- Google OAuth plus phone number and password.


## Decision
**Google OAuth plus phone number and password**. OTP, despite being the best option, was dropped for the pilot/MVP due to cost and complexity. The password based authentication covers users without Google accounts while Google OAuth covers users who prefer not to manage passwords and are cool with that flow. Both paths feed into the same profile completion flow, keeping the post-registration experience consistent. To prevent users who aren't tech comfortable and sign up with phone number and password, tokens will have long expiry time.