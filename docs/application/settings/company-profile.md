# Company Profile

This document explains the store profile settings page in `Pengaturan`.

## Applies To

Authenticated users with store/company profile access.

## Purpose

The store profile settings page lets a seller update company identity, contact information, address, description, and company image.

## Main Files

- `src/views/auth/seller/CompanyProfileView.vue`
  Owns seller company profile layout and image preview placement.

- `src/components/company-profile/CompanySetting.vue`
  Owns the editable company form, validation state, and save behavior.

- `src/components/address/LocationPicker.vue`
  Provides the same pinpoint workflow used by buyer addresses.

- `src/components/company-profile/ImagePreview.vue`
  Owns company image preview, upload, zoom, and delete confirmation.

## Fields

Current field order:

```text
Name -> email -> Phone
Lokasi Toko (Pinpoint)
Deskripsi
```

Required fields:

- `name`
- `email`
- `phone`
- a confirmed pinpoint and address detail

Optional fields:

- `deskripsi`

## QA Coverage

- [TOK-8 Pinpoint Address QA](../../qa/tok-8-pinpoint-address.md) tracks
  store-location UI verification.
- [TOK-23 Company Audit Log QA](../../qa/tok-23-company-audit-log.md) tracks
  Profil Toko audit UI verification.

## Behavior

- Inputs are directly editable.
- There is no edit mode toggle.
- The form uses one `Simpan` button.
- The save button visually appears disabled when any frontend validation error exists.
- The save button is disabled while the update request is processing.
- Frontend validation blocks submit when required fields are empty.
- The shared map picker renders directly in the form, so the seller can search, move the marker, and enter address details without opening another modal.
- A legacy manual store address remains visible as a verification notice until it is replaced on the same row with a verified pinpoint.
- Geoapify failures preserve company fields, restore the marker to the last
  verified coordinate, and block saving until verification is available.

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

Successful image upload and deletion are audited by the backend as
`company.image_uploaded` and `company.image_deleted`. The frontend does not
create audit rows itself.

## Audit Log

Successful Profil Toko saves are recorded by the backend as `company.updated`.
The Audit Log page displays those events under the `Toko` filter group. See
[Audit Log](./audit-log.md) and
[TOK-23 Company Audit Log QA](../../qa/tok-23-company-audit-log.md).

## Store/API Usage

Company update is handled through Vuex company update actions in `src/store.js`.

Keep backend field names unchanged when building payloads:

- `name`
- `email`
- `phone`
- `location_source`
- `latitude`
- `longitude`
- `geoapify_place_id`
- `formatted_address`
- `address_detail`
- `deskripsi`
