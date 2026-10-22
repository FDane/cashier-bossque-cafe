# Assumptions

- Manager navigation/pages and the new inventory creation page/API are admin-only: an active, business-authorized staff user must have `isAdmin === true` on the shared user document or a resolved POS role of `ADMIN`. `MANAGER` alone does not grant these screens. Existing role resolution for other operations remains unchanged. No shared user fields are written.
- Inventory creation uses the authenticated server's business ID, writes only new root inventory documents, and stores cost/price in RM decimals. It does not create a saleable product automatically. Existing shared Carwash rules are unchanged; this admin restriction is enforced by the POS server, not a restriction on other shared-project clients.

- The shared carwash admin repository is not present in this project, so integration modules are documented separately.
- Phase 1 checkout is blocked offline; cached catalog and cart remain usable.
- Tax rate is stored as a percentage number (for example `6`), and all money is integer sen.
- Staff login uses shared Firebase email/password with synthetic `<NRIC>@bossque.carwash` emails and a 12-hour server session cookie. POS never writes shared user identity fields.
- Role resolution: `posRole` ADMIN/MANAGER/CASHIER, then legacy `role` ADMIN/MANAGER/CASHIER (STAFF maps to CASHIER), then active `isStaff` defaults to CASHIER.
- Receipt counter is daily and per terminal, with the counter document scoped under the cafe business namespace.
- Product images use a branded placeholder until Storage upload is wired by the shared admin.
