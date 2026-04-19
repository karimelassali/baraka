## 2024-04-08 - [High] Weak Randomness in OTP Generation
**Vulnerability:** The codebase was using `Math.random()` to generate One-Time Passwords (OTPs) for SMS verification.
**Learning:** `Math.random()` is not a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) and can be predicted, making authentication flows vulnerable to brute force or prediction attacks.
**Prevention:** Always use Node's `crypto` module (`randomInt` or `randomBytes`) or the Web Crypto API (`crypto.getRandomValues`) for any security-sensitive random number generation, such as tokens, passwords, or OTPs.

## 2024-05-20 - [High] Insecure Voucher Code Generation
**Vulnerability:** The codebase was using `Math.random()` to generate financial voucher codes in `app/api/admin/vouchers/route.js`.
**Learning:** Using predictable randomness for financial objects like vouchers allows attackers to potentially predict valid voucher codes, leading to unauthorized use and financial loss.
**Prevention:** Ensure all sensitive business logic tokens (vouchers, promo codes) use cryptographically secure random number generators like `crypto.randomBytes()`.

## 2024-05-27 - [High] XSS Vulnerability in Voucher Download
**Vulnerability:** The `Vouchers` dashboard component was using `qrSection.innerHTML` to dynamically construct HTML that included `voucher.id` and `voucher.expires_at`.
**Learning:** Using `innerHTML` with dynamically interpolated variables, even if they seem benign (like dates or IDs), is a dangerous anti-pattern that can lead to Cross-Site Scripting (XSS) if the source data is ever manipulated or if unexpected input types are passed.
**Prevention:** Always use safe DOM manipulation methods like `document.createElement()`, `element.textContent`, and `element.appendChild()` when dynamically constructing DOM elements in client-side code, rather than injecting raw HTML strings.
