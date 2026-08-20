# OPRE NATURE — Catalogue Management App

A local, no-install catalogue management system for OPRE NATURE: an admin dashboard for managing
184 hand-made Lebanese products across 13 categories, a mobile-friendly public catalogue, and an
A4 print/PDF export that closely reproduces `OPRE_NATURE_Product_Catalogue_Draft.pdf`.

## Why this is plain HTML/CSS/JS (no Vite, no Node, no build step)

This machine has no Node.js/npm and no Python installed, so the app is built as **vanilla HTML,
CSS and JavaScript with zero build step**. That's actually the more convenient outcome for a
non-technical shop owner: there is nothing to install, compile or keep updated. If you later have
Node available and want a build pipeline, the code is plain enough to drop into Vite unchanged —
but it isn't required.

## 1. Running it locally

You have two options. Both are "no install" — pick whichever is easier.

### Option A — just double-click (simplest)

Double-click `public/index.html`, `public/admin.html` or `public/print.html` to open them directly
in your browser (Chrome, Edge or Firefox). No server needed.

### Option B — tiny local server (optional, needed only if double-click doesn't work in your browser)

Some browsers/OS combinations restrict `file://` pages slightly. If you hit any odd behaviour,
run the included zero-dependency PowerShell static server (uses only built-in Windows PowerShell,
no Node/Python required):

```bash
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

Then open:
- Public catalogue: http://localhost:8080/public/index.html
- Admin dashboard: http://localhost:8080/public/admin.html
- Print/PDF view: http://localhost:8080/public/print.html

Stop the server with Ctrl+C in that terminal.

## 2. File structure

```
Backend Files/
  public/
    index.html          customer-facing catalogue (public, mobile-friendly)
    admin.html           private management dashboard
    print.html            A4 print / PDF export view
    assets/               logo (transparent PNG, multiple sizes)
  css/
    theme.css              shared OPRE NATURE design tokens (colour palette, type, tables)
    public.css              public catalogue layout + mobile responsive rules
    admin.css                admin dashboard layout
    print.css                 A4 page layout for print/PDF
  js/
    catalogue-data.js          ORIGINAL seed data: 184 products, 13 categories (see below)
    data-store.js                localStorage persistence, JSON/CSV import-export, price formatting
    qr.js                          QR code rendering wrapper
    public.js                       public catalogue page logic
    admin.js                          admin dashboard logic (CRUD, filters, live preview)
    print.js                           paginates the catalogue into real A4 pages for printing
    publish.js                          one-click "Publish to GitHub" (Contents API, no export/import needed)
  vendor/
    qrcode.js                            QR code generator (MIT, kazuhikoarase/qrcode-generator)
  tools/
    serve.ps1                              optional local static server (see Option B above)
  VALIDATION_REPORT.md                       import validation report (184/184 products confirmed)
  OPRE_NATURE_Sample_Export.pdf                 sample PDF export, for visual comparison
  README.md                                      this file
```

No files outside `Backend Files/` are required at runtime — the transparent logo has already been
extracted from the supplied artwork into `public/assets/`.

## 3. How data is stored

- The **original catalogue** (184 products, 13 categories, prices, settings) lives in
  `js/catalogue-data.js`, built directly from `OPRE_NATURE_Product_Catalogue_Draft.pdf` (see
  `VALIDATION_REPORT.md` for the full import audit).
- Every edit you make in the admin dashboard is saved to your **browser's `localStorage`** the
  moment you click **Save changes**. This is per-browser, per-machine storage — it does not touch
  the original files and does not sync between computers.
- **"Reset to original"** in the admin sidebar permanently discards all local edits and restores
  the data from `catalogue-data.js` (with a confirmation warning, since this cannot be undone).
- To move your catalogue to another computer, or keep an external backup, use **Export JSON** and
  **Import JSON** (see below).

## 4. Updating products and prices (no code editing required)

1. Open `public/admin.html`.
2. Use the **Products** tab to search, filter by category/status, and edit any field inline
   (name, Lebanese/traditional name, format, price, price basis, category, active/inactive).
   Click **Edit** on a row for the full form (description, internal notes, image).
3. Use **+ Add product** to create a new product, **Duplicate** to clone an existing one, and
   **Delete** to remove one permanently (deactivating instead is usually safer — it hides a
   product from customers without losing its history).
4. Reorder products with the ▲ / ▼ buttons in the **Order** column (keyboard accessible).
5. Manage categories in the left sidebar: rename inline, reorder with ▲ / ▼, or **+ Add category**.
   A category can only be deleted once it has no products left in it.
6. Click **Save changes** in the top bar. The status indicator switches from "Unsaved changes" to
   "All changes saved". If you navigate away with unsaved changes, the browser will warn you.
7. Use the **Live preview** tab to see exactly what customers will see before you save.

### Price basis

Every product has a `priceBasis` of `item`, `kg` or `ml`. This controls both the printed format
and the number of decimals shown:
- `item` → `$8.00`
- `kg` → `$5.00 / kg`
- `ml` → `$0.0060 / ml` (4 decimals, since per-ml prices are very small numbers)

## 5. Exporting the PDF catalogue

### Button-driven (recommended for normal use)

1. Open `public/print.html` (or click **Open print / PDF view** in the admin dashboard).
2. Wait for "N pages ready…" to appear — the page automatically lays out every **active** product
   into real A4 pages, repeating table headers and never splitting a row across a page break.
3. Click **🖨️ Print / Save as PDF**, then in the browser's print dialog choose **Save as PDF**
   (destination), and set margins to **None** (the page already has its own margins built in).

### Command-line (for automation, e.g. re-generating the PDF after a scripted data update)

If you have Chrome or Edge installed (most Windows PCs do), you can generate the PDF without
opening a browser window, using the browser's built-in headless print-to-PDF — no Puppeteer or
Node.js required:

```bash
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="catalogue.pdf" --print-to-pdf-no-header "http://localhost:8080/public/print.html"
```

(Requires the local server from Option B to be running, since headless Chrome needs a URL rather
than a `file://` path for reliable asset loading. Substitute the Edge path if you prefer Edge.)

A sample export generated this way is included at `OPRE_NATURE_Sample_Export.pdf` for comparison
against the original PDF.

**If you later gain access to Node.js**, the same print.html page can be driven by Puppeteer or
Playwright for a scripted pipeline with header/footer templating support — the HTML/CSS needs no
changes, only a small Node script calling `page.pdf({ path, format: 'A4', printBackground: true })`.

## 6. Configuring the public catalogue URL & QR code

1. In the admin dashboard, open the **Settings & QR** tab.
2. Enter the real public URL where you will host `public/index.html` (e.g.
   `https://www.oprenature.com/catalogue`) into **Public catalogue URL**.
3. A QR code preview appears immediately if the URL is valid. `localhost`, `127.0.0.1` and
   `file://` paths are rejected — the QR code is only ever generated for a real public address.
4. Click **Save changes**. The QR code now appears:
   - on the public catalogue page footer,
   - on the PDF cover and contact pages,
   - in the admin Settings tab (for a quick sanity check).
5. If you leave this blank, the admin dashboard shows a clear warning, and the QR code is simply
   omitted from both the public page and the PDF — it is never generated pointing at a local or
   placeholder address.

## 7. Deploying the public catalogue

**This catalogue is already deployed.** Current live setup:

- **Public catalogue:** https://oprenature.com (custom domain; also reachable at
  https://oprenaturelb.github.io/opre-nature-catalogue/)
- **Hosting:** GitHub Pages, free, serving directly from the `master` branch of
  `github.com/OPRENATURELB/opre-nature-catalogue`
- **DNS:** managed at Namecheap (BasicDNS) — 4 `A` records on `@` pointing at GitHub Pages'
  IPs (185.199.108/109/110/111.153), and a `CNAME` on `www` pointing at
  `oprenaturelb.github.io.`

### Publishing catalogue edits (no export/import needed)

Because the public catalogue reads from each visitor's own browser, **admin edits only reach
visitors once they're published** — editing locally and clicking "Save changes" alone only updates
your own browser. As of this build, that's a single click:

1. Make your edits in the admin dashboard (**Products** / **Settings & QR** tabs).
2. Go to **Settings & QR → Publish to GitHub**.
3. Click **🚀 Publish to GitHub Pages**.

This regenerates `js/catalogue-data.js` from your current catalogue and pushes it straight to the
GitHub repo via the Contents API — GitHub Pages rebuilds automatically, live within ~30–60 seconds.
No JSON file to export, send, or manually commit.

**One-time setup** for the Publish button (already done on this machine, needed again only on a
new computer or if the token is regenerated/revoked):
1. Go to https://github.com/settings/tokens?type=beta while logged into the `OPRENATURELB` GitHub
   account.
2. **Generate new token** → **Only select repositories** → `opre-nature-catalogue` →
   **Repository permissions → Contents → Read and write** → **Generate token**.
3. Paste the token into the **Access token** field in Settings & QR → Publish to GitHub. It's
   saved only in that browser's `localStorage`, under its own key — never bundled into JSON/CSV
   exports.

If you'd rather deploy somewhere other than GitHub Pages, the site is still a fully static
`public/` + `css/` + `js/` + `vendor/` folder set with no server-side code — copy it to any static
host (Netlify, Vercel, S3, plain FTP), keeping the folder structure intact, and update
`publicCatalogueUrl` in Settings to match. In that case the Publish button (which is GitHub-specific)
won't apply — fall back to Export JSON → manually update `catalogue-data.js` → redeploy.

## 8. Adding authentication later (if you host the admin dashboard)

`public/admin.html` currently has **no login** — it is designed to run locally on the shop owner's
own machine, where anyone who can open the file already has full access to the computer. If you
ever deploy `admin.html` somewhere reachable over the network, you must add access control first,
for example:
- Put it behind your static host's built-in password protection (Netlify/Vercel password
  protection, or an `.htaccess` Basic Auth rule on Apache/Nginx), or
- Add a small backend (even a single serverless function) that checks a session cookie before
  serving `admin.html` or before accepting writes, or
- Restrict it to a private network / VPN rather than the public internet.

Do not deploy `admin.html` publicly without one of the above — it can edit and reset the entire
catalogue.

## 9. Export/Import/Reset reference

| Action | Where | Effect |
|---|---|---|
| Publish to GitHub Pages | Settings & QR tab | Pushes the current catalogue straight to the live site (see §7) — the normal way to publish an update |
| Export JSON | Admin sidebar | Downloads the full catalogue (categories, products, settings) as a timestamped `.json` file — for backups or manual deploys |
| Import JSON | Admin sidebar | Replaces the in-memory catalogue with the contents of a chosen `.json` file (validated first; asks for confirmation; takes effect once you click **Save changes**) |
| Export CSV | Admin sidebar | Downloads all products as a spreadsheet-friendly `.csv` (one row per product, includes category name, price, price basis, active status, dates) |
| Reset to original | Admin sidebar | Discards all local edits and restores the catalogue currently embedded in `catalogue-data.js` (i.e. the last-published version), after a confirmation warning |

## 10. Accessibility notes

- Semantic HTML throughout (`<table>` with `<th scope="col">`, `<nav>`, `<main>`, `<dialog>`).
- All interactive controls are keyboard operable, including product/category reordering (▲ / ▼
  buttons rather than drag-only) and every dialog (native `<dialog>` element — focus-trapped,
  closable with <kbd>Esc</kbd>).
- Visible focus outlines on every control (see `.opre-skip-link` and `:focus-visible` rules in
  `css/theme.css`).
- The public catalogue's product tables reflow into single-column cards under 640px width so
  nothing requires horizontal scrolling on a phone.
- Logo images carry descriptive `alt` text; the QR code SVG carries `role="img"` with an
  `aria-label` describing its destination URL.

## 11. Quality checks already performed

See `VALIDATION_REPORT.md` for the full data-import audit. In addition:
- Rendered every page of the source PDF to images and compared them against the generated print
  view page-by-page (cover, about, table of contents, all 13 category pages, contact page) —
  layout, palette, typography and page numbering match.
- Confirmed the print pagination engine repeats table headers and never splits a row when a
  category is edited to exceed one page (tested by tightening the layout until "Pickles &
  Preserved Vegetables", the largest category at 26 products, was forced across two pages, then
  restored).
- Generated `OPRE_NATURE_Sample_Export.pdf` via headless Chrome and confirmed: 17 pages (matching
  the source), selectable text (not flattened to images), correct page numbers, and that the QR
  code is correctly omitted when no public URL is configured.
- Verified JSON export → import round-trips without data loss (184 products / 13 categories).
- Verified localStorage persistence survives a full page reload in the admin dashboard.
- Tested the public catalogue at desktop and mobile (375px) widths, including live search
  filtering and the WhatsApp contact button.

## 12. Known limitations / good-to-know

- Product images are optional and stored as a URL/path string (`image` field) rather than
  uploaded binary data, to keep `localStorage` usage small. Add image files under
  `public/assets/products/` and reference them by relative path.
- The print engine paginates the Table of Contents as a single page; if you add so many categories
  that the list no longer fits one A4 page, split it manually in `js/print.js` (a rare edge case
  well beyond the current 13 categories).
- `localStorage` has a browser storage quota (typically 5–10MB) — comfortably enough for 184+
  text-only product records, but keep an eye on it if you add many large embedded image data URLs.
