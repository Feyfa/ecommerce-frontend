# TOK-77 Saldo History Display QA

[TOK-77](https://muhammadjidan-31088882.atlassian.net/browse/TOK-77) covers the
display counterpart to the backend history fallback.

## Local scenarios

- **TOK-77-FE-01 Known directions.** Passed. Incoming and withdrawal amounts
  retain their text, sign, and green or red styling. Numeric strings still
  format as amounts.
- **TOK-77-FE-02 Unknown directions.** Passed. An unrecognized or null type
  displays the available amount without a sign and uses the neutral color.
- **TOK-77-FE-03 Missing amount.** Passed. Null and absent amounts display
  `—`. A recorded zero keeps the rupiah amount and its known direction.

## Local checks

- `npm run test:unit` went from 25 to 32 passing tests on Node 22.
  Four of the new cases reproduced the incorrect behavior before the fix.
- `npm run lint` and `npm run format:check` passed.
- A Vite production build to a temporary directory passed with a chunk-size
  warning.

Vitest verifies the two component formatter methods used by the history row
template. The local run uses synthetic inputs and no browser session.
