## 2024-04-08 - [High] Weak Randomness in OTP Generation
**Vulnerability:** The codebase was using `Math.random()` to generate One-Time Passwords (OTPs) for SMS verification.
**Learning:** `Math.random()` is not a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) and can be predicted, making authentication flows vulnerable to brute force or prediction attacks.
**Prevention:** Always use Node's `crypto` module (`randomInt` or `randomBytes`) or the Web Crypto API (`crypto.getRandomValues`) for any security-sensitive random number generation, such as tokens, passwords, or OTPs.

## 2024-05-20 - [High] Weak Randomness in Identifiers and Vouchers
**Vulnerability:** The codebase was using `Math.random()` to generate voucher codes and unique identifiers (for image uploads and SMS campaign tracking).
**Learning:** `Math.random()` is not cryptographically secure, and the values it produces can be predicted, making it unsafe for any identifier that requires uniqueness and unguessability, such as voucher codes which carry monetary value.
**Prevention:** Use `crypto.randomInt` (Node.js) or `crypto.getRandomValues()` (Web Crypto API) instead of `Math.random()` for any sensitive identifier generation, including voucher codes.
