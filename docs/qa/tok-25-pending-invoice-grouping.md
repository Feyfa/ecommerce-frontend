# TOK-25 Pending Invoice Grouping QA

## Purpose

This checklist verifies the buyer presentation of one unpaid invoice containing several store packages.

## Manual Verification

| ID | Status | Verification | Expected Result |
| --- | --- | --- | --- |
| TOK-25-FE-01 | ✅ | Checkout products from two different stores using one virtual account. | The buyer `Belum Dibayar` list shows one card with `Pesanan dari 2 toko`, one virtual account, and the invoice total once. |
| TOK-25-FE-02 | ✅ | Open the detail modal from the grouped pending card. | The modal shows the invoice ID, one shared delivery address, and a separate package for every store, including products, courier, shipping price, and note. |
| TOK-25-FE-03 | ✅ | Copy the virtual account from the grouped card and detail modal. | Both actions copy the same invoice virtual-account number. |
| TOK-25-FE-04 | ✅ | Check the `Belum Dibayar` tab count and the `Menunggu Pembayaran` notice. | Both counts equal the number of pending invoice cards, not the number of stores. |
| TOK-25-FE-05 | ✅ | Complete payment and revisit buyer and seller transaction pages. | Buyer paid history and seller pages show one row per store with that store's own total. |
