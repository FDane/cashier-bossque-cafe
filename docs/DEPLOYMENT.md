# Deployment

1. Copy `.env.example` to `.env.local`, provide Firebase client/admin values, business ID, terminal ID, session max age, idle lock minutes, and optional printer proxy secrets. The private key uses escaped `\\n` newlines.
2. Deploy the Next.js app to the host serving `cashier.cafe.bossque.my`; set a DNS CNAME to that host and add the domain to Firebase Auth Authorized domains.
3. Camera scanning requires HTTPS. Phase 1 provides wedge/manual scanning; add BarcodeDetector/ZXing camera UI before enabling camera workflows in production.
4. Merge the clearly marked `MERGE INTO EXISTING RULES` block in `firestore.rules` into the existing shared Firebase rules. Do not replace legacy Carwash root rules. If the existing `users` rule is more permissive, retain it for Carwash compatibility; cafe code relies only on its own server-verified reads. Merge index entries rather than replacing the shared index file.
5. Deploy `storage.rules` as an additive businesses namespace rule. Set Storage CORS as required by the shared admin.
6. Add `cashier.cafe.bossque.my` to Firebase Auth Authorized domains. The same Firebase project and Auth users are shared with Carwash. Cookies are Secure and therefore require HTTPS. Run `scripts/seed.ts` manually after configuration; do not run scripts automatically. Do not run the removed claims script.
7. Configure the printer server endpoint and secret. Browser printing remains available as a fallback; printer/drawer failures must not roll back a completed sale.
