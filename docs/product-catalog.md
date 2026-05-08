# Product Catalog

Specific skincare product recommendations come from `server/productCatalog.js`.

The AI model identifies general signals such as skin type, hydration, oil balance, texture, tone, and barrier support. The backend then matches those signals against a curated product catalog.

Do not bulk-copy product databases from SkinSort or similar sites unless you have an API, data license, or written permission. SkinSort can still be useful as an external research/reference destination, but NextSelf should keep its own verified catalog or import only data you are allowed to use.

This is safer than asking the model to invent products because:

- Product names and links can be verified.
- Amazon links can be replaced with affiliate links later.
- Unsafe or unsuitable product categories can be excluded.
- Regional availability can be controlled.

## Current Link Strategy

The catalog uses Amazon search URLs, not scraped Amazon product URLs. Exact prices, stock, ratings, and ASIN-specific links should come from the Amazon Product Advertising API once you have an approved affiliate account.

Official brand URLs are included where possible so users can verify products outside of Amazon. For launch, product claims should stay conservative and avoid medical diagnosis language.

## Launch Checklist

- Replace generic Amazon search URLs with affiliate-tagged links after Amazon Associates approval.
- Add regional fields for US, UK, EU, India, and global availability.
- Add budget tiers.
- Add contraindication rules for strong actives.
- Add patch-test and sunscreen disclaimers in the app.
- Add a CSV or admin import flow for products you own, manually curate, or license.
