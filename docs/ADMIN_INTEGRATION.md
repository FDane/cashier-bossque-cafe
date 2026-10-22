# Shared admin integration

No shared carwash admin source was present in this repository. The POS therefore exposes a clean cafe namespace and API contract without guessing at legacy code. The intended admin adapter must:

- switch `businessId` between Carwash legacy-root adapters and cafe `/businesses/{bid}` paths; Inventory is shared root and must always filter by `businessId` (missing means Carwash), with a business switcher to prevent mixed lists;
- manage products/categories/modifiers/recipes/inventory/customers/staff/settings/reports;
- upload resized WebP images to `businesses/{bid}/products/{id}/`;
- provision optional `posRole` and `businessIds` on shared `users/{uid}` documents. The POS only reads these fields and never writes them;
- import/export the documented CSV product fields.
  Copy-paste starting modules are in `admin-modules/`.
