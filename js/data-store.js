// OPRE NATURE — catalogue persistence layer
// Storage: localStorage (key below). Falls back to the original seed data
// (js/catalogue-data.js) on first run or after a "reset to original".
// Plain classic script — exposes window.Opre.Store. Load after catalogue-data.js.
(function (global) {
  'use strict';

  const STORAGE_KEY = 'opre-catalogue-v1';
  const SCHEMA_VERSION = 1;

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getOriginalCatalogue() {
    return deepClone(global.Opre.Data.ORIGINAL_CATALOGUE);
  }

  function loadCatalogue() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getOriginalCatalogue();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.categories)) {
        throw new Error('Malformed catalogue in storage');
      }
      parsed.settings = Object.assign({}, global.Opre.Data.ORIGINAL_SETTINGS, parsed.settings || {});
      return parsed;
    } catch (err) {
      console.error('Failed to parse stored catalogue, falling back to original.', err);
      return getOriginalCatalogue();
    }
  }

  function saveCatalogue(catalogue) {
    const payload = Object.assign({}, catalogue, { schemaVersion: SCHEMA_VERSION, savedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  }

  function resetToOriginal() {
    localStorage.removeItem(STORAGE_KEY);
    return getOriginalCatalogue();
  }

  function hasLocalEdits() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  // ---------- IDs ----------

  function generateId(prefix) {
    prefix = prefix || 'item';
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function formatUpdatedDate(date) {
    date = date || new Date();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  // ---------- Price formatting ----------
  // Display rule (matches the source PDF): item/kg -> 2 decimals, ml -> 4 decimals.
  function formatPrice(product) {
    const decimals = product.priceBasis === 'ml' ? 4 : 2;
    const amount = Number(product.price || 0).toFixed(decimals);
    const symbol = product.currency === 'USD' || !product.currency ? '$' : product.currency + ' ';
    const suffix = product.priceBasis === 'kg' ? ' / kg' : product.priceBasis === 'ml' ? ' / ml' : '';
    return `${symbol}${amount}${suffix}`;
  }

  // ---------- Derived views ----------

  function activeProducts(catalogue) {
    return catalogue.products.filter((p) => p.active);
  }

  function productsByCategory(catalogue, categoryId, opts) {
    opts = opts || {};
    return catalogue.products
      .filter((p) => p.categoryId === categoryId && (opts.includeInactive || p.active))
      .sort((a, b) => a.order - b.order);
  }

  function sortedCategories(catalogue) {
    return catalogue.categories.slice().sort((a, b) => a.order - b.order);
  }

  // ---------- JSON import/export ----------

  function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportJSON(catalogue) {
    const payload = Object.assign({}, catalogue, { exportedAt: new Date().toISOString(), schemaVersion: SCHEMA_VERSION });
    downloadBlob(JSON.stringify(payload, null, 2), `opre-nature-catalogue-${todayISO()}.json`, 'application/json');
  }

  function validateCatalogueShape(data) {
    const errors = [];
    if (!data || typeof data !== 'object') errors.push('File is not a valid JSON object.');
    if (!Array.isArray(data && data.categories)) errors.push('Missing "categories" array.');
    if (!Array.isArray(data && data.products)) errors.push('Missing "products" array.');
    if (data && Array.isArray(data.categories)) {
      data.categories.forEach((c, i) => {
        if (!c.id || !c.name) errors.push(`Category at index ${i} is missing "id" or "name".`);
      });
    }
    if (data && Array.isArray(data.products)) {
      data.products.forEach((p, i) => {
        if (!p.id || !p.name) errors.push(`Product at index ${i} is missing "id" or "name".`);
        if (typeof p.price !== 'number') errors.push(`Product "${p.name || i}" has a non-numeric price.`);
        if (['item', 'kg', 'ml'].indexOf(p.priceBasis) === -1) errors.push(`Product "${p.name || i}" has an invalid priceBasis.`);
      });
    }
    return errors;
  }

  function importJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          const errors = validateCatalogueShape(data);
          if (errors.length) {
            reject(new Error('Invalid catalogue file:\n' + errors.slice(0, 10).join('\n')));
            return;
          }
          if (!data.settings) data.settings = getOriginalCatalogue().settings;
          resolve(data);
        } catch (err) {
          reject(new Error('Could not parse file as JSON: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Could not read the selected file.'));
      reader.readAsText(file);
    });
  }

  // ---------- CSV export ----------

  const CSV_COLUMNS = [
    'id', 'category', 'name', 'lebaneseName', 'description', 'format',
    'price', 'currency', 'priceBasis', 'order', 'active', 'notes',
    'createdDate', 'modifiedDate', 'priceUpdatedDate',
  ];

  function csvEscape(value) {
    const str = value === null || value === undefined ? '' : String(value);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  }

  function exportCSV(catalogue) {
    const catName = {};
    catalogue.categories.forEach((c) => { catName[c.id] = c.name; });
    const rows = [CSV_COLUMNS.join(',')];
    catalogue.products
      .slice()
      .sort((a, b) => (a.categoryId < b.categoryId ? -1 : a.categoryId > b.categoryId ? 1 : a.order - b.order))
      .forEach((p) => {
        const row = [
          p.id, catName[p.categoryId] || p.categoryId, p.name, p.lebaneseName, p.description, p.format,
          p.price, p.currency, p.priceBasis, p.order, p.active, p.notes,
          p.createdDate, p.modifiedDate, p.priceUpdatedDate,
        ];
        rows.push(row.map(csvEscape).join(','));
      });
    downloadBlob(rows.join('\r\n'), `opre-nature-catalogue-${todayISO()}.csv`, 'text/csv');
  }

  // ---------- Public URL / QR helpers ----------

  function isPublicUrlValid(url) {
    if (!url) return false;
    try {
      const u = new URL(url);
      if (u.protocol === 'file:') return false;
      const host = u.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')) return false;
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  global.Opre = global.Opre || {};
  global.Opre.Store = {
    getOriginalCatalogue, loadCatalogue, saveCatalogue, resetToOriginal, hasLocalEdits,
    generateId, todayISO, formatUpdatedDate, formatPrice,
    activeProducts, productsByCategory, sortedCategories,
    downloadBlob, exportJSON, validateCatalogueShape, importJSONFile,
    exportCSV, isPublicUrlValid,
  };
})(window);
