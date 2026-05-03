# PocketIQ Security Specification

## 1. Data Invariants
- A UserProfile can only be created by the authenticated user with a matching UID.
- Transactions and Goals must belong to the user's subcollection.
- Transactions must have a valid type (expense, earning, saving).
- Amounts must be positive numbers.
- Timestamps must be server-validated.

## 2. The "Dirty Dozen" Payloads (Red Team Tests)
1. **Identity Spoofing**: Attempt to create a UserProfile for another UID.
2. **Ghost Fields**: Attempt to add `isAdmin: true` to a UserProfile.
3. **Negative Balance**: Attempt to create a negative transaction amount.
4. **Invalid Type**: Attempt to set transaction type to "robbery".
5. **PII Breach**: Attempt to read the profile of another user.
6. **Goal Poisoning**: Attempt to set currentAmount to -1,000,000.
7. **Timestamp Fraud**: Attempt to set `updatedAt` to a future date manually.
8. **Orphaned Write**: Attempt to create a transaction without being logged in.
9. **Bulk Scrape**: Attempt to list all users in the system.
10. **ID Poisoning**: Attempt to use a 2MB string as a Goal ID.
11. **Immutable Update**: Attempt to change `email` after initial profile creation.
12. **State Shortcutting**: Attempt to bypass onboarding status.

## 3. The Test Plan
Verify that all "Dirty Dozen" payloads result in `PERMISSION_DENIED`.
Rules will enforce strict schema validation and identity checks.
