# NEXMOLD site

Single-file, hash-routed static site. No build tooling beyond `python3 build.py`.

```
_parts/        page sources: nav.html, footer.html, *.body.html (one per view)
assets/        style.css · catalog.js (ALL product data, prices, brand, contact) · main.js (logic)
build.py       assembles index.html (serve this) and dist/artifact.html (inline copy for embedded previews)
index.html     the site — open locally or upload to any static host (GitHub Pages, Netlify, Cloudflare Pages, 阿里云 OSS)
```

Routes: `#home`, `#home-origin`, `#products`, `#products-slides`, `#product-SB`, `#services`, `#services-dfm`, `#rfq`, `#rfq-design`.

## Edit
- Brand name, email, phone, address: top of `assets/catalog.js` (`NM.brand`, `NM.contact`).
- Products: `NM.products` in `assets/catalog.js`. Each has specs, a configurator (`fields`, `pn`, `price`), an animated SVG `fig`, optional `calc` and `drawing`.
- Copy and sections: `_parts/*.body.html`. Then run `python3 build.py`.

## Placeholders to replace before going live
- Brand name NEXMOLD and contact details.
- All prices, lead times, material/hardness specs, size bands (marked at the top of `catalog.js`).
- CAD buttons show a toast; link them to real STEP/DWG files.
- RFQ form builds text + mailto only; connect to a form backend or email API if you want submissions stored.
