# Frontend Documentation

This folder contains technical documentation for the Vue frontend.

Frontend-specific documentation should live here. Backend API behavior, database decisions, Laravel configuration, and backend-owned behavior should live in the backend repository docs.

Deployment, branching, staging, production, Docker Compose, and server runbooks are owned by the deploy repository docs:

```text
../deploy/docs/
```

## Current Documents

- [Local Native Development](setup/local-native-development.md)
  Explains how to run the frontend and backend locally without Docker by using local HTTPS domains and native app runtimes.

- [Clerk Authentication](application/auth/clerk-auth.md)
  Documents the frontend Clerk migration direction, custom auth pages, route guard strategy, backend bootstrap flow, and post-migration cleanup rules.

- [Seller Product](application/seller/product.md)
  Documents the seller product UI, state, flows, API usage, and UI decisions.

- [Seller Dashboard](application/seller/dashboard.md)
  Documents the seller dashboard UI, state, API usage, layout order, and UI decisions.

- [Buyer Belanja](application/buyer/belanja.md)
  Documents the buyer shopping UI, state, search flow, add-to-cart flow, API usage, and UI decisions.

- [Buyer Cart](application/buyer/cart.md)
  Documents the buyer cart UI, state, quantity controls, checked-state flows, API usage, and error sync behavior.

- [Buyer Checkout](application/buyer/checkout.md)
  Documents the buyer checkout UI, state, seller-package layout, courier/payment choices, API usage, and stale-checkout recovery behavior.

- [Transaction](application/transaction.md)
  Documents the shared buyer and seller transaction UI, filters, cards, detail modal, pagination, and role-based display rules.

- [Settings](application/settings/README.md)
  Documents the shared buyer and seller settings UI, route structure, profile forms, address management, balance, bank accounts, security settings, remaining coming soon settings routes, and shared styling rules.

- [Commit Guidelines](development/commit-guidelines.md)
  Explains how to keep commits focused on one purpose and separate unrelated changes.

## Documentation Rules

Use English for every Markdown document in this folder.

Existing component names, route names, state names, API field names, and other code identifiers should keep their real names even when they use Indonesian words.

Write documents for humans first:

- Start with the purpose of the document.
- Keep feature notes lightweight and practical.
- Prefer clear sections over long paragraphs.
- Include file paths when they help future maintenance.
- Update the relevant document whenever a frontend feature changes its flow, state, UI behavior, or API usage.

## Documentation Structure

```text
docs/
  README.md

  application/
    auth/
      clerk-auth.md
    buyer/
      belanja.md
      cart.md
      checkout.md
    seller/
      product.md
      dashboard.md
    settings/
      README.md
      shared-ui.md
      profile.md
      company-profile.md
      address.md
      balance.md
      bank-account.md
      security.md
      audit-log.md
    transaction.md

  development/
    commit-guidelines.md

  setup/
    local-native-development.md
```

Keep documentation directly related to Vue implementation inside `application/`. Keep setup and development-process documentation in their dedicated top-level folders.
