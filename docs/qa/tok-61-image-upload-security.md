# TOK-61 Image Upload Security QA

## Scope

The user profile, company profile, and seller product file pickers now offer
JPEG, PNG, and GIF. Their client-side checks reject other browser-reported
MIME types, including SVG, before dispatching an upload. The backend validates
file content independently and remains the source of truth.

## Local Verification

| ID | Status | Verification | Evidence |
| --- | --- | --- | --- |
| TOK-61-FE-01 | ✅ | Align all three file pickers with the backend format contract. | Reviewed `ImagePreview.vue` for user/company and `ProductImagesInput.vue`: each uses `image/jpeg,image/png,image/gif`, rejects other MIME types, and displays a format-specific error. |
| TOK-61-FE-02 | ✅ | Check frontend code quality and tests. | `npm run lint` and `npm run format:check` passed; `npm run test:unit` passed 25 tests across two files. |
| TOK-61-FE-03 | ✅ | Build the frontend. | `npm run build` succeeded. |

Browser-based upload smoke testing and deployed runtime verification have not
been performed for this local change. A read-only September 28, 2026 SSH
inventory found no SVG files or database image paths ending in SVG on staging
or production. The inventory is a snapshot before this change is deployed.
