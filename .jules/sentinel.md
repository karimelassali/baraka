## 2024-04-08 - [High] Weak Randomness in OTP Generation
**Vulnerability:** The codebase was using `Math.random()` to generate One-Time Passwords (OTPs) for SMS verification.
**Learning:** `Math.random()` is not a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) and can be predicted, making authentication flows vulnerable to brute force or prediction attacks.
**Prevention:** Always use Node's `crypto` module (`randomInt` or `randomBytes`) or the Web Crypto API (`crypto.getRandomValues`) for any security-sensitive random number generation, such as tokens, passwords, or OTPs.

## 2024-05-20 - [High] Insecure Voucher Code Generation
**Vulnerability:** The codebase was using `Math.random()` to generate financial voucher codes in `app/api/admin/vouchers/route.js`.
**Learning:** Using predictable randomness for financial objects like vouchers allows attackers to potentially predict valid voucher codes, leading to unauthorized use and financial loss.
**Prevention:** Ensure all sensitive business logic tokens (vouchers, promo codes) use cryptographically secure random number generators like `crypto.randomBytes()`.
## 2024-05-24 - [Replaced innerHTML with DOM manipulation for Voucher UI generation]
**Vulnerability:** XSS (Cross-Site Scripting) risk through `innerHTML` interpolation of data in `components/dashboard/Vouchers.jsx`.
**Learning:** Even when interpolating seemingly safe backend-provided properties (like `id` or dates), using `innerHTML` to dynamically generate DOM elements presents a persistent security risk if those variables are ever influenced by unescaped inputs.
**Prevention:** Always use safe DOM manipulation methods (`document.createElement`, `textContent`, `appendChild`) over `innerHTML` when dynamically constructing UI elements, enforcing security at the framework boundary.
