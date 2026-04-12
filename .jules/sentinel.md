## 2024-04-08 - [High] Weak Randomness in OTP Generation
**Vulnerability:** The codebase was using `Math.random()` to generate One-Time Passwords (OTPs) for SMS verification.
**Learning:** `Math.random()` is not a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) and can be predicted, making authentication flows vulnerable to brute force or prediction attacks.
**Prevention:** Always use Node's `crypto` module (`randomInt` or `randomBytes`) or the Web Crypto API (`crypto.getRandomValues`) for any security-sensitive random number generation, such as tokens, passwords, or OTPs.

## 2026-04-12 - [Insecure Randomness in Voucher Code Generation]
**Vulnerability:** The voucher generation in `app/api/admin/vouchers/route.js` used `Math.random()` to generate unique codes.
**Learning:** `Math.random()` is not a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG). This means that voucher codes could potentially be predicted or brute-forced, which might allow attackers to redeem vouchers they don't own.
**Prevention:** Use a CSPRNG like `crypto.randomBytes()` from the Node.js `crypto` module to generate unpredictable, secure random values for sensitive codes like vouchers.
