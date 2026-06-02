# Frontend Documentation

This folder contains technical documentation for the Vue frontend.

Frontend-specific documentation should live here. Backend API behavior, database decisions, Laravel configuration, and backend deployment notes should live in the backend repository docs.

## Current Documents

- [Local HTTPS Development](setup/local-https-development.md)
  Explains how to run the frontend and backend through local HTTPS domains.

- [Seller Product](features/seller/01-product.md)
  Documents the seller product UI, state, flows, API usage, and UI decisions.

- [Buyer Belanja](features/buyer/01-belanja.md)
  Documents the buyer shopping UI, state, search flow, add-to-cart flow, API usage, and UI decisions.

- [Buyer Cart](features/buyer/02-cart.md)
  Documents the buyer cart UI, state, quantity controls, checked-state flows, API usage, and error sync behavior.

- [Buyer Checkout](features/buyer/03-checkout.md)
  Documents the buyer checkout UI, state, seller-package layout, courier/payment choices, API usage, and stale-checkout recovery behavior.

- [Transaction](features/transaction.md)
  Documents the shared buyer and seller transaction UI, filters, cards, detail modal, pagination, and role-based display rules.

- [Account](account/README.md)
  Documents the shared buyer and seller account UI, tab order, profile forms, address management, balance, bank accounts, security, and shared styling rules.

## Documentation Rules

Use English for every Markdown document in this folder.

Existing component names, route names, state names, API field names, and other code identifiers should keep their real names even when they use Indonesian words.

Write documents for humans first:

- Start with the purpose of the document.
- Keep feature notes lightweight and practical.
- Prefer clear sections over long paragraphs.
- Include file paths when they help future maintenance.
- Update the relevant document whenever a frontend feature changes its flow, state, UI behavior, or API usage.

## Suggested Future Structure

The documentation can grow using this structure:

```text
docs/
  README.md

  setup/
    local-https-development.md

  features/
    transaction.md
    seller/
      01-product.md
    buyer/
      01-belanja.md
      02-cart.md
      03-checkout.md

  account/
    README.md
    shared-ui.md
    profile.md
    company-profile.md
    address.md
    balance.md
    bank-account.md
    security.md
```

This structure does not need to be created all at once. Add new documents only when the project actually needs them.
