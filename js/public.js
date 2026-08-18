// OPRE NATURE — public catalogue page script. Plain classic script.
// Load order (see public/index.html): catalogue-data.js, data-store.js, vendor/qrcode.js, qr.js, public.js
(function () {
  'use strict';
  const Store = window.Opre.Store;
  const isPreview = new URLSearchParams(location.search).get('preview') === '1';

  function loadForPage() {
    if (isPreview) {
      try {
        const raw = sessionStorage.getItem('opre-preview-catalogue');
        if (raw) return JSON.parse(raw);
      } catch (err) { /* fall through to normal load */ }
    }
    return Store.loadCatalogue();
  }

  if (isPreview) {
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'opre-preview-update') location.reload();
    });
    const banner = document.createElement('div');
    banner.textContent = 'Live preview — showing unsaved admin edits';
    banner.style.cssText = 'background:#FDB515;color:#174E27;text-align:center;font-family:sans-serif;font-weight:700;font-size:0.8rem;padding:4px;';
    document.body.prepend(banner);
  }

  const catalogue = loadForPage();
  const settings = catalogue.settings;

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

  function whatsappLink(phone, message) {
    const digits = (phone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(message);
    return `https://wa.me/${digits}?text=${text}`;
  }

  // ---------- Header ----------
  document.title = `${settings.companyName} — Product Catalogue`;
  document.getElementById('opre-updated-date').textContent = `Catalogue updated: ${settings.catalogueUpdatedDate}`;

  // ---------- About ----------
  document.getElementById('opre-about-text').textContent = settings.aboutText;

  // ---------- Category nav + sections ----------
  const nav = document.getElementById('opre-category-nav-inner');
  const sectionsRoot = document.getElementById('opre-category-sections');
  const categories = Store.sortedCategories(catalogue);

  function buildProductRow(p) {
    // Note: p.name already carries the full "Lebanese Term (English gloss)" text
    // exactly as printed in the source PDF, so lebaneseName is not re-appended here
    // (it remains available as searchable metadata — see the data-search attribute below).
    const nameCell = el('td', {}, [
      el('span', { class: 'opre-product-name', text: p.name }),
    ]);
    return el('tr', { 'data-search': `${p.name} ${p.lebaneseName || ''}`.toLowerCase() }, [
      nameCell,
      el('td', { class: 'opre-price-col', 'data-label': 'Price', text: Store.formatPrice(p) }),
    ]);
  }

  categories.forEach((cat) => {
    const products = Store.productsByCategory(catalogue, cat.id);
    if (!products.length) return;

    nav.appendChild(el('a', { href: `#cat-${cat.id}`, text: cat.name }));

    const table = el('table', { class: 'opre-table', 'aria-describedby': `cat-${cat.id}-count` }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', { scope: 'col', text: 'Product / Format' }),
          el('th', { scope: 'col', class: 'opre-price-col', text: 'Retail Price' }),
        ]),
      ]),
      el('tbody', {}, products.map(buildProductRow)),
    ]);

    const section = el('section', { class: 'opre-category-section', id: `cat-${cat.id}`, 'aria-labelledby': `cat-${cat.id}-h` }, [
      el('h2', { id: `cat-${cat.id}-h`, class: 'opre-heading', text: cat.name }),
      el('p', { id: `cat-${cat.id}-count`, class: 'opre-category-count', text: `${products.length} available products and formats` }),
      table,
      el('p', { class: 'opre-footer-notice', text: settings.pricingNotice }),
    ]);
    sectionsRoot.appendChild(section);
  });

  // Highlight active nav link on scroll
  const navLinks = Array.prototype.slice.call(nav.querySelectorAll('a'));
  const sections = Array.prototype.slice.call(sectionsRoot.querySelectorAll('section'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = nav.querySelector(`a[href="#${entry.target.id}"]`);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('is-active'));
            link.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
  }

  // ---------- Search ----------
  const searchInput = document.getElementById('opre-search');
  const noResults = document.getElementById('opre-no-results');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let anyVisible = false;
    sections.forEach((section) => {
      const rows = Array.prototype.slice.call(section.querySelectorAll('tbody tr'));
      let visibleInSection = 0;
      rows.forEach((row) => {
        const match = !q || row.dataset.search.indexOf(q) !== -1;
        row.style.display = match ? '' : 'none';
        if (match) visibleInSection++;
      });
      section.style.display = visibleInSection ? '' : 'none';
      if (visibleInSection) anyVisible = true;
    });
    noResults.hidden = anyVisible || !q;
  });

  // ---------- Footer / contact / WhatsApp / QR ----------
  document.getElementById('opre-contact-address').textContent = settings.address;
  document.getElementById('opre-contact-phone').textContent = `Tel / WhatsApp: ${settings.phone}`;
  const emailLink = document.getElementById('opre-contact-email');
  emailLink.href = `mailto:${settings.email}`;
  emailLink.textContent = settings.email;
  const siteLink = document.getElementById('opre-contact-website');
  siteLink.href = settings.website.indexOf('http') === 0 ? settings.website : `https://${settings.website}`;
  siteLink.textContent = settings.website;
  document.getElementById('opre-contact-instagram').textContent = `Instagram: ${settings.instagram}`;

  const waFab = document.getElementById('opre-whatsapp-fab');
  waFab.href = whatsappLink(settings.phone, 'Hello OPRE NATURE, I would like to place an order.');

  const qrBox = document.getElementById('opre-qr-box');
  const qrWarning = document.getElementById('opre-qr-warning');
  const rendered = window.Opre.QR.renderQRCode(qrBox, settings.publicCatalogueUrl);
  qrBox.hidden = !rendered;
  qrWarning.hidden = rendered;
})();
