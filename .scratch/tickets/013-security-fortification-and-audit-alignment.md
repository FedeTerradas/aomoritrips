# Ticket 013 — Spec: Fortificación de Seguridad, Criptografía de Vouchers y Mitigación de Auditoría

**Estado**: `ready-for-agent`  
**Prioridad**: Alta (Seguridad & Cumplimiento Académico)  
**Dependencias**: 001, 002, 003, 006  
**Labels**: `ready-for-agent`, `security`, `audit`

---

## Problem Statement

Como plataforma turística de comercio electrónico que gestiona paquetes de alto valor económico (`TravelPack` de $3,500–$5,500 USD), datos sensibles de pasajeros y un motor de IA conversacional (`TravelAgentOrchestrator`), AomoriTrips presentaba brechas perimetrales y criptográficas críticas identificadas en la auditoría académica dura (`auditoria_aomoritrips_v2_dura.md`):

1. **Falsificación de Vouchers Offline**: El comprobante digital (`OfflineVoucher`) utilizaba una codificación trivial reversible en Base64 (`Buffer.from(code - email).toString('base64')`). Cualquier usuario con conocimientos básicos podía decodificar el digest, alterar el código de reserva o el correo, re-codificarlo y falsificar un voucher válido de miles de dólares para el operador turístico o Ryokan.
2. **Ausencia de Rate Limiting en Superficie de Ataque**: Los endpoints `/api/auth/login`, `/api/bookings` y `/api/agent/chat` carecían de estrangulamiento de peticiones por IP, exponiendo al sistema a ataques de fuerza bruta de credenciales, spam masivo de reservas en base de datos y agotamiento deliberado del presupuesto de tokens del modelo LLM.
3. **Omisión de Cabeceras Perimetrales HTTP**: La aplicación Next.js no configuraba directivas elementales de defensa en profundidad (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy`), dejando la UI vulnerable a ataques de clickjacking y ataques de inyección MIME.
4. **Contradicción entre Documentación y Realidad de Código**: El informe de entrega final (`informe_entrega_final_aomoritrips.md`) declaraba defensas perimetrales y criptográficas que no se correspondían con el código real desplegado.

---

## Solution

Implementar una arquitectura de defensa en profundidad ligera, nativa y estricta (alineada con la filosofía YAGNI/Ponytail y los principios de seguridad de `ia-cowork-review`), cerrando la brecha entre el código real y el informe de auditoría:

1. **Firma Criptográfica HMAC-SHA256**: Generación de un `securityDigest` no reversible y autenticado mediante clave simétrica (`VOUCHER_HMAC_SECRET`) en Node.js nativo (`crypto.createHmac`), garantizando la integridad estricta del `OfflineVoucher` y su código QR sin posibilidad de falsificación o alteración offline.
2. **Rate Limiter Perimetral en Memoria**: Módulo perimetral autónomo basado en ventanas deslizantes (`Map` en memoria) que impone límites por IP cliente:
   - `/api/auth/login`: Máximo 5 intentos por minuto (mitigación de fuerza bruta).
   - `/api/bookings`: Máximo 5 creaciones por minuto (mitigación de spam de transacciones).
   - `/api/agent/chat`: Máximo 15 consultas por minuto (mitigación de DoS de tokens de IA).
   - Respuestas estándar HTTP `429 Too Many Requests` con cabeceras `Retry-After`, `X-RateLimit-Limit` y `X-RateLimit-Remaining`.
3. **Cabeceras de Seguridad HTTP Globales**: Configuración en `next.config.ts` de cabeceras de respuesta HTTP (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, `Content-Security-Policy`, `Permissions-Policy`).
4. **Sincronización del Informe de Entrega**: Actualización exhaustiva del informe académico con referencias verificables a código, justificación honesta del alcance educativo (SQLite) y adición de las heurísticas de Nielsen faltantes (H5 y H9).

---

## User Stories

1. As a traveler purchasing a high-value `TravelPack`, I want my `OfflineVoucher` to be cryptographically signed with HMAC-SHA256, so that my reservation cannot be tampered with, intercepted, or invalidated at destination ryokans.
2. As a travel platform administrator, I want login attempts to be rate-limited to 5 per minute per IP, so that automated credential-stuffing and brute-force attacks against passenger accounts are thwarted.
3. As a platform operator, I want travel package booking requests to be throttled to 5 per minute per IP, so that malicious bots cannot flood the database with bogus orders.
4. As a platform owner with LLM API cost budgets, I want chat requests to the `TravelAgentOrchestrator` to be restricted to 15 per minute per IP, so that attackers cannot exhaust API tokens or trigger denial-of-service states.
5. As an abusive client exceeding the rate threshold, I want to receive an HTTP 429 status code with a descriptive `Retry-After` header in seconds, so that compliant clients understand when they may retry.
6. As a security auditor, I want all HTTP responses from Next.js to include anti-clickjacking headers (`X-Frame-Options: DENY`), so that the booking and payment interface cannot be embedded in malicious iframes.
7. As a security auditor, I want strict Content Security Policy (CSP) and MIME-type sniffing protections enabled, so that cross-site scripting (XSS) and script spoofing attack surfaces are minimized.
8. As an evaluator or professor reviewing the final delivery, I want the security claims in the academic report to match exact verifiable lines of code, so that academic integrity and technical truthfulness are preserved.
9. As a developer deploying to Vercel, I want a fallback development key for voucher verification with an explicit warning, so that local development remains frictionless while production requires a configured secret.
10. As an offline traveler in rural Aomori without mobile network connectivity, I want the QR validation system to mathematically confirm voucher authenticity using the cryptographic signature without needing to hit a remote server.

---

## Implementation Decisions

### Decision 1: Cryptographic Digest for OfflineVouchers

- Replaced trivial `Buffer.from(bookingCode-email).toString("base64")` with HMAC-SHA256:

```typescript
createHmac("sha256", secret)
  .update(`${bookingCode}:${booking.customerEmail}:${booking.totalPriceUsd}`)
  .digest("hex");
```

- The secret key is resolved from `process.env.VOUCHER_HMAC_SECRET`. If undefined in non-production environments, a deterministic development secret is used alongside a logged security warning.

### Decision 2: In-Memory Sliding Window Rate Limiter

- Implemented a zero-dependency in-memory rate limiter using native JavaScript `Map<string, { count: number; resetTime: number }>` to satisfy YAGNI and prevent external infrastructure overhead (Redis) for educational MVP scope.
- Client IP resolution hierarchy:
  1. `x-forwarded-for` (first IP before comma, trimmed)
  2. `x-real-ip`
  3. Fallback to `"127.0.0.1"`
- Returns an object `{ success: boolean; limit: number; remaining: number; reset: number }`.
- Integrated directly into Route Handlers before parsing request payload:
  - Returns `NextResponse.json({ error: "Demasiadas peticiones..." }, { status: 429, headers: { ... } })`.

### Decision 3: HTTP Security Headers in Next.js Engine

- Configured inside `headers()` in `next.config.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;`

### Decision 4: Report and Audit Synchronization

- Corrected Section 6 of `informe_entrega_final_aomoritrips.md` to document the 6 actual security layers with file paths and parameters.
- Clarified SQLite vs. PostgreSQL rationale as a deliberate educational single-node deployment decision.
- Expanded Nielsen heuristics to include H5 (Error Prevention) and H9 (Recognize, Diagnose, and Recover from Errors).

---

## Testing Decisions

### Quality of Tests

- Tests verify **pure external behavioral contracts**, avoiding mocking internal data structures:
  - Route-level and utility-level seams are exercised with realistic HTTP Request mock envelopes.
  - Verification includes sliding window reset boundaries, retry header calculation, multi-hop proxy IP extraction, and cryptographic digest tampering detection.

### Modules Tested

- `src/lib/security/rate-limit.ts` (14 unit and integration tests)
- `tests/security_red_phase.test.ts` (5 boundary and edge case tests)
- Total test coverage: 40/40 passing tests across the entire suite (`npm test`).

### Prior Art in Codebase

- Follows the existing Vitest suite in `tests/` (`agent_orchestrator.test.ts`, `booking_flow.test.ts`).

---

## Out of Scope

- **Distributed Redis / Upstash Rate Limiting**: Deemed unnecessary complexity for the educational project scope; in-memory Map provides robust defense for single-instance Vercel Serverless / Node runtime.
- **Asymmetric Public-Key Cryptography (ECDSA/Ed25519)**: HMAC-SHA256 provides sufficient integrity verification when the verification entity shares the platform secret.
- **Hardware Security Modules (HSM) / Vault Integration**: Out of scope for academic course delivery.
- **OAuth 2.0 / OpenID Connect Identity Providers**: The platform maintains session/token based native auth.

---

## Further Notes

- **Production Deployment Pre-requisite**: Add `VOUCHER_HMAC_SECRET` (32+ bytes random hex string) to Vercel Environment Variables and local `.env.local`.
- **Academic Video Delivery**: Record the walkthrough video showcasing the rate limiter triggering HTTP 429 and the QR code displaying the HMAC-SHA256 signature, then replace the honest pending note in `informe_entrega_final_aomoritrips.md`.
