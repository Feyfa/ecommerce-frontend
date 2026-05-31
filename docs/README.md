# Frontend Documentation

This folder contains technical documentation for the Vue frontend.

Frontend-specific documentation should live here. Backend API behavior, database decisions, Laravel configuration, and backend deployment notes should live in the backend repository docs.

## Current Documents

- [Local HTTPS Development](setup/local-https-development.md)
  Explains how to run the frontend and backend through local HTTPS domains.

- [Seller Product](features/seller/01-product.md)
  Documents the seller product UI, state, flows, API usage, and UI decisions.

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
    seller/
      01-product.md
      02-transaction.md
    buyer/
      01-product-browsing.md
      02-cart.md
      03-checkout.md
```

This structure does not need to be created all at once. Add new documents only when the project actually needs them.
