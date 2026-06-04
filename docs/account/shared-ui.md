# Account Shared UI

This document records shared UI rules for `Akun Saya`.

Use this document when changing account layout, inputs, buttons, modals, validation states, or Element Plus overrides.

## Applies To

Buyer and seller account pages.

## Layout Rules

- `AccountView.vue` is the shared account shell.
- The page keeps one account title, one role badge, and one tab bar.
- Feature content should avoid unnecessary nested cards.
- Forms use one primary content card when the card helps group related fields.
- Address content is separated into its own buyer tab instead of being embedded inside profile.

## Input Styling

Account inputs should visually match the add/edit product form style:

- white background;
- subtle gray border;
- soft focus state;
- consistent height for text inputs and selects;
- consistent spacing between label, field, and error text;
- textarea fields use the same border, radius, and focus behavior as text inputs.

Native controls should be avoided where Element Plus provides a more consistent component:

- date range filters use `el-date-picker`;
- selects use `el-select`;
- confirmation dialogs use Element Plus confirmation UI.

## Required Fields

Required fields show an inline red `*` in the label.

Required markers should be used for fields that are blocked by frontend validation before submit.

## Error States

Error behavior is intentionally immediate only after the field is validated.

Rules:

- Error text appears below the field.
- Error border stays red while the field is focused.
- Error focus must not switch back to the normal purple focus border.
- A form save button should look disabled when one or more frontend errors exist.
- Processing state may disable the button, but should not add duplicate loading indicators around the form.

## Buttons

Primary actions use the purple primary button style.

Destructive actions should use a danger visual treatment instead of a plain gray button.

Profile and company forms are always editable and use one save button:

```text
Simpan
```

They should not require an edit mode button before the user can type.

## Modals

Account modals should use the same visual language as the account page:

- clear title at the top;
- aligned form labels and inputs;
- required markers where needed;
- red error state on focus;
- one primary action and one cancel/destructive action where cancellation is needed.

## Image Preview

Profile and company image preview should follow product image zoom behavior where practical.

Deletion confirmation should use Element Plus confirmation UI instead of SweetAlert.

## Auth State During Logout

When logout succeeds, or when the API returns an unauthenticated response, account UI must clear persistent auth data and runtime state together.

Use the shared auth session helpers instead of repeating manual `localStorage` cleanup in components:

```js
import { clearAuthSession, syncClearedAuthSessionToStore } from '@/authSession';

clearAuthSession();
syncClearedAuthSessionToStore(this.$store);
```

This keeps Vuex synchronized with the empty storage state so account components do not keep rendering stale user or company data after logout.

If a token expires because the same account logged out from another browser, show the Element Plus session-expired alert before redirecting to login:

```js
showSessionExpiredWarning()
  .finally(() => {
    this.$router.push('/login');
  });
```

Account components that read `user`, `company`, or active account mode during route transitions should use safe access such as `user?.img`, `company?.img`, or a validated `activeAccountMode`, because the values can be empty while the page is navigating to login.
