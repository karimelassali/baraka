## 2024-04-08 - [High] Weak Randomness in OTP Generation
**Vulnerability:** The codebase was using `Math.random()` to generate One-Time Passwords (OTPs) for SMS verification.
**Learning:** `Math.random()` is not a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) and can be predicted, making authentication flows vulnerable to brute force or prediction attacks.
**Prevention:** Always use Node's `crypto` module (`randomInt` or `randomBytes`) or the Web Crypto API (`crypto.getRandomValues`) for any security-sensitive random number generation, such as tokens, passwords, or OTPs.

## 2024-05-20 - [High] Insecure Voucher Code Generation
**Vulnerability:** The codebase was using `Math.random()` to generate financial voucher codes in `app/api/admin/vouchers/route.js`.
**Learning:** Using predictable randomness for financial objects like vouchers allows attackers to potentially predict valid voucher codes, leading to unauthorized use and financial loss.
**Prevention:** Ensure all sensitive business logic tokens (vouchers, promo codes) use cryptographically secure random number generators like `crypto.randomBytes()`.

## 2024-05-18 - [XSS Prevention in innerHTML and JSON-LD]
**Vulnerability:** XSS vulnerabilities via `innerHTML` usage with template literals, and `dangerouslySetInnerHTML` injecting unsanitized JSON in `<script type="application/ld+json">`.
**Learning:** Even internal data properties embedded via `innerHTML` can pose an XSS risk if the data comes from a database. And for JSON-LD, using `JSON.stringify` directly in a script tag is unsafe because a malicious payload could close the script tag early `</script><script>alert()</script>`.
**Prevention:** Always use safe DOM APIs like `document.createElement` and `textContent` instead of `innerHTML`. For JSON injected in a script block, replace `<` with its unicode equivalent `\u003c` via `.replace(/</g, '\\u003c')`.
