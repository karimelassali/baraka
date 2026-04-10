## 2025-10-18 - [Fix Critical Service Role Key Exposure]
**Vulnerability:** The Supabase Service Role Key was exposed to the client by being prefixed with `NEXT_PUBLIC_` (`NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`). This allows unauthorized users full read/write access to the database bypassing RLS.
**Learning:** Developers might mistakenly prefix sensitive keys with `NEXT_PUBLIC_` to make them available to client-side code, not realizing the severe security implications.
**Prevention:** Ensure that only non-sensitive environment variables use the `NEXT_PUBLIC_` prefix. Sensitive keys like the Service Role Key must never be prefixed this way and should only be accessed server-side using `SUPABASE_SERVICE_ROLE_KEY`.
