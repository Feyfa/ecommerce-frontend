# User Profile

This document explains the user profile settings page in `Pengaturan`.

## Applies To

Authenticated users.

## Purpose

The profile settings page lets a user update personal account information and manage their profile image.

## Main Files

- `src/views/auth/buyer/UserProfileView.vue`
  Owns buyer profile layout and image preview placement.

- `src/components/user-profile/UserSetting.vue`
  Owns the buyer profile form, validation state, and save behavior.

- `src/components/user-profile/ImagePreview.vue`
  Owns profile image preview, upload, zoom, and delete confirmation.

## Fields

Current field order:

```text
Name -> email -> Phone
Tanggal Lahir -> Jenis Kelamin
```

Required fields:

- `phone`

Optional fields:

- `tanggal_lahir`
- `jenis_kelamin`

Read-only fields:

- `name`
- `email`

## Behavior

- Profile inputs are directly editable except `name` and `email`.
- Name is displayed from the authenticated account and is not submitted by this form.
- Email is displayed from the authenticated account and is not submitted by this form.
- There is no edit mode toggle.
- The form uses one `Simpan` button.
- The save button visually appears disabled when any frontend validation error exists.
- The save button is disabled while the update request is processing.
- Frontend validation blocks submit when required fields are empty.

## Validation

Required validation should run at the frontend before dispatching the update action.

Error behavior:

- required label marker is visible;
- error message appears below the field;
- focused error field keeps a red border;
- one error is enough to make the save button look disabled.

## Image Behavior

The image preview supports:

- zoom image;
- upload image;
- delete image with Element Plus confirmation UI.

The profile image behavior should stay close to the product image zoom interaction so users see a familiar preview pattern.

## Store/API Usage

Profile update is handled through Vuex user update actions in `src/store.js`.

Keep backend field names unchanged when building payloads:

- `jenis_kelamin`
- `tanggal_lahir`
- `phone`
