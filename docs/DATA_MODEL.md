# Cafe namespace data model

`users` and `inventory` are shared root collections. Cafe inventory must have `businessId == NEXT_PUBLIC_BUSINESS_ID`; documents without it belong to Carwash. Existing fields are additive-only and remain unchanged. All other cafe data is under `/businesses/{businessId}/...`.
