// OPRE NATURE — A4 print/PDF layout builder. Plain classic script.
// Pre-paginates real DOM content into fixed-size .a4-page elements so that
// (a) table rows never split across pages, (b) table headers repeat on every
// continuation page, and (c) every page gets a correct, real page number —
// none of which Chrome's print engine guarantees purely via CSS.
(function () {
  'use strict';
  const Store = window.Opre.Store;
  const QR = window.Opre.QR;
  const catalogue = Store.loadCatalogue();
  const settings = catalogue.settings;
  const root = document.getElementById('pages-root');

  function el(tag, attrs, children) {
    attrs = attrs || {};
    const node = document.createElement(tag);
    Object.keys(attrs).forEach((k) => {
      const v = attrs[k];
      if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : children ? [children] : []).forEach((c) => c && node.appendChild(c));
    return node;
  }

  const pages = [];

  function newPage() {
    const contentEl = el('div', { class: 'a4-content' });
    const footerEl = el('div', { class: 'a4-footer' }, [
      el('span', { text: `${settings.companyName} | Hand Made Natural Products` }),
      el('span', { class: 'a4-page-num' }),
    ]);
    const pageEl = el('div', { class: 'a4-page' }, [
      el('div', { class: 'a4-topbar' }, [el('span', { class: 'opre-dot' })]),
      contentEl,
      footerEl,
    ]);
    root.appendChild(pageEl);
    pages.push(pageEl);
    return contentEl;
  }

  function fits(contentEl) {
    return contentEl.scrollHeight <= contentEl.clientHeight + 1;
  }

  // ---------- Cover page ----------
  (function buildCover() {
    const content = newPage();
    const cover = el('div', { class: 'a4-cover' }, [
      el('img', { class: 'opre-logo', src: 'assets/opre-logo.png', alt: `${settings.companyName} logo` }),
      el('h1', { text: 'PRODUCT CATALOGUE' }),
      el('p', { class: 'opre-tagline-brown', text: settings.tagline }),
      el('p', { class: 'opre-tagline-green', text: settings.subTagline }),
      el('p', { class: 'opre-meta', text: 'Retail and professional formats • Prices include VAT' }),
      el('p', { class: 'a4-updated', text: `Catalogue updated: ${settings.catalogueUpdatedDate}` }),
    ]);
    if (Store.isPublicUrlValid(settings.publicCatalogueUrl)) {
      const qrWrap = el('div', { class: 'a4-cover-qr' });
      cover.appendChild(qrWrap);
      QR.renderQRCode(qrWrap, settings.publicCatalogueUrl);
    }
    content.appendChild(cover);
  })();

  // ---------- About page ----------
  (function buildAbout() {
    const content = newPage();
    const about = el('div', { class: 'a4-about' }, [
      el('h2', { class: 'a4-heading', text: settings.subTagline }),
    ]);
    settings.aboutText.split('\n\n').forEach((para) => {
      about.appendChild(el('p', { text: para }));
    });
    const grid = el('div', { class: 'a4-feature-grid' }, [
      el('div', {}, [el('h3', { text: 'Locally cultivated' }), el('p', { text: 'Selected ingredients rooted in our region.' })]),
      el('div', {}, [el('h3', { text: 'Made with care' }), el('p', { text: 'Prepared with patience, care and passion.' })]),
      el('div', {}, [el('h3', { text: 'Authentic flavours' }), el('p', { text: 'Traditional Lebanese tastes for home and hospitality.' })]),
    ]);
    about.appendChild(grid);
    content.appendChild(about);
  })();

  // ---------- Product Families (TOC) page ----------
  const categories = Store.sortedCategories(catalogue).map((cat) => ({
    cat,
    products: Store.productsByCategory(catalogue, cat.id),
  })).filter((c) => c.products.length);

  (function buildTOC() {
    const content = newPage();
    content.appendChild(el('h2', { class: 'a4-heading', text: 'Product Families' }));
    categories.forEach((c, i) => {
      content.appendChild(
        el('div', { class: 'a4-toc-row' }, [
          el('span', { class: 'num', text: String(i + 1).padStart(2, '0') }),
          el('span', { class: 'name', text: c.cat.name }),
          el('span', { class: 'count', text: `${c.products.length} products` }),
        ])
      );
    });
  })();

  // ---------- Category pages (paginated) ----------
  function buildTable() {
    const thead = el('thead', {}, [
      el('tr', {}, [
        el('th', { scope: 'col', text: 'Product / Format' }),
        el('th', { scope: 'col', class: 'price-col', text: 'Retail Price' }),
      ]),
    ]);
    const tbody = el('tbody');
    return { table: el('table', { class: 'a4-table' }, [thead, tbody]), tbody };
  }

  categories.forEach(({ cat, products }) => {
    let content = newPage();
    content.appendChild(el('h2', { class: 'a4-heading', text: cat.name }));
    let countEl = el('p', { class: 'a4-cat-count', text: `${products.length} available products and formats` });
    content.appendChild(countEl);
    let { table, tbody } = buildTable();
    content.appendChild(table);

    products.forEach((p) => {
      const row = el('tr', {}, [
        el('td', {}, [el('span', { class: 'opre-product-name', text: p.name })]),
        el('td', { class: 'price-col', text: Store.formatPrice(p) }),
      ]);
      tbody.appendChild(row);
      if (!fits(content)) {
        tbody.removeChild(row);
        content = newPage();
        content.appendChild(el('h2', { class: 'a4-heading', text: `${cat.name} (continued)` }));
        const built = buildTable();
        content.appendChild(built.table);
        tbody = built.tbody;
        tbody.appendChild(row);
      }
    });

    const notice = el('p', { class: 'a4-pricing-notice', text: settings.pricingNotice });
    content.appendChild(notice);
    if (!fits(content)) {
      content.removeChild(notice);
      content = newPage();
      content.appendChild(el('h2', { class: 'a4-heading', text: `${cat.name} (continued)` }));
      content.appendChild(notice);
    }
  });

  // ---------- Contact page ----------
  (function buildContact() {
    const content = newPage();
    const contact = el('div', { class: 'a4-contact' }, [
      el('img', { class: 'opre-logo', src: 'assets/opre-logo.png', alt: `${settings.companyName} logo` }),
      el('h2', { text: 'Orders & Enquiries' }),
      el('p', { text: settings.address }),
      el('p', { text: `Tel / WhatsApp: ${settings.phone}` }),
      el('p', { text: settings.email }),
      el('p', { text: settings.website }),
      el('p', { text: `Instagram: ${settings.instagram}` }),
      el('p', { class: 'a4-tag', text: 'Hand Made • Natural • Locally Cultivated' }),
    ]);
    if (Store.isPublicUrlValid(settings.publicCatalogueUrl)) {
      const qrWrap = el('div', { class: 'a4-cover-qr' });
      contact.appendChild(qrWrap);
      QR.renderQRCode(qrWrap, settings.publicCatalogueUrl);
    }
    content.appendChild(contact);
  })();

  // ---------- Finalize: real page numbers, reveal ----------
  pages.forEach((pageEl, i) => {
    pageEl.querySelector('.a4-page-num').textContent = String(i + 1);
  });
  root.classList.add('is-ready');
  document.getElementById('print-status').textContent = `${pages.length} pages ready — ${categories.reduce((s, c) => s + c.products.length, 0)} active products across ${categories.length} categories.`;

  document.getElementById('btn-print').addEventListener('click', () => window.print());
})();
