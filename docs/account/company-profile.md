# Company Profile

This document explains the seller company profile tab in `Akun Saya`.

## Applies To

Seller only.

## Purpose

The company profile tab lets a seller update company identity, contact information, address, description, and company image.

## Main Files

- `src/views/auth/seller/CompanyProfileView.vue`
  Owns seller company profile layout and image preview placement.

- `src/components/company-profile/CompanySetting.vue`
  Owns the editable company form, validation state, and save behavior.

- `src/components/company-profile/ImagePreview.vue`
  Owns company image preview, upload, zoom, and delete confirmation.

## Fields

Current field order:

```text
Name -> email -> Phone
Alamat
Deskripsi
```

Required fields:

- `name`
- `email`
- `phone`
- `alamat`

Optional fields:

- `deskripsi`

## Behavior

- Inputs are directly editable.
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

The company image preview supports:

- zoom image;
- upload image;
- delete image with Element Plus confirmation UI.

The zoom behavior should stay close to the product image preview pattern.

## Store/API Usage

Company update is handled through Vuex company update actions in `src/store.js`.

Keep backend field names unchanged when building payloads:

- `name`
- `email`
- `phone`
- `alamat`
- `deskripsi`

