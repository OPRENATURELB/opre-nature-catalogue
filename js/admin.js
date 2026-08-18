// OPRE NATURE — admin dashboard script. Plain classic script.
// Load order: catalogue-data.js, data-store.js, vendor/qrcode.js, qr.js, admin.js
(function () {
  'use strict';
  const Store = window.Opre.Store;
  const QR = window.Opre.QR;

  const state = {
    catalogue: Store.loadCatalogue(),
    dirty: false,
    editingProductId: null, // null = adding new
  };

  function markDirty() {
    state.dirty = true;
    const status = document.getElementById('opre-save-status');
    status.textContent = 'Unsaved changes';
    status.classList.add('is-dirty');
    refreshPreview();
  }

  function clearDirty() {
    state.dirty = false;
    const status = document.getElementById('opre-save-status');
    status.textContent = 'All changes saved';
    status.classList.remove('is-dirty');
  }

  window.addEventListener('beforeunload', (e) => {
    if (state.dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // ---------------- Dialog helpers (native <dialog> = accessible, focus-trapped, ESC to close) ----------------

  function confirmDialog(title, message, opts) {
    opts = opts || {};
    const dlg = document.getElementById('dlg-confirm');
    document.getElementById('dlg-confirm-title').textContent = title;
    document.getElementById('dlg-confirm-message').textContent = message;
    const okBtn = document.getElementById('btn-confirm-ok');
    okBtn.textContent = opts.confirmLabel || 'Confirm';
    return new Promise((resolve) => {
      function onOk() { cleanup(); dlg.close(); resolve(true); }
      function onCancel() { cleanup(); dlg.close(); resolve(false); }
      function onCancelEvt() { cleanup(); resolve(false); }
      function cleanup() {
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        dlg.removeEventListener('cancel', onCancelEvt);
      }
      const cancelBtn = document.getElementById('btn-confirm-cancel');
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      dlg.addEventListener('cancel', onCancelEvt);
      dlg.showModal();
    });
  }

  function promptDialog(title, label, defaultValue) {
    const dlg = document.getElementById('dlg-prompt');
    document.getElementById('dlg-prompt-title').textContent = title;
    document.getElementById('dlg-prompt-label').textContent = label;
    const input = document.getElementById('prompt-input');
    input.value = defaultValue || '';
    const form = document.getElementById('form-prompt');
    return new Promise((resolve) => {
      function onSubmit(e) {
        e.preventDefault();
        cleanup();
        dlg.close();
        resolve(input.value.trim() || null);
      }
      function onCancel() { cleanup(); dlg.close(); resolve(null); }
      function onCancelEvt() { cleanup(); resolve(null); }
      function cleanup() {
        form.removeEventListener('submit', onSubmit);
        cancelBtn.removeEventListener('click', onCancel);
        dlg.removeEventListener('cancel', onCancelEvt);
      }
      const cancelBtn = document.getElementById('btn-prompt-cancel');
      form.addEventListener('submit', onSubmit);
      cancelBtn.addEventListener('click', onCancel);
      dlg.addEventListener('cancel', onCancelEvt);
      dlg.showModal();
      input.focus();
    });
  }

  function toast(message, isError) {
    const t = document.createElement('div');
    t.className = 'opre-toast' + (isError ? ' error' : '');
    t.setAttribute('role', 'status');
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  // ---------------- Category sidebar ----------------

  function renderCategorySidebar() {
    const list = document.getElementById('opre-category-list');
    list.innerHTML = '';
    const cats = Store.sortedCategories(state.catalogue);
    cats.forEach((cat, idx) => {
      const count = state.catalogue.products.filter((p) => p.categoryId === cat.id).length;
      const li = document.createElement('li');

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = cat.name;
      nameInput.setAttribute('aria-label', `Category name: ${cat.name}`);
      nameInput.addEventListener('change', () => {
        cat.name = nameInput.value.trim() || cat.name;
        markDirty();
        renderProductTable();
        renderCategoryFilterOptions();
      });

      const countSpan = document.createElement('span');
      countSpan.className = 'opre-count';
      countSpan.textContent = `(${count})`;

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'opre-icon-btn';
      upBtn.setAttribute('aria-label', `Move ${cat.name} up`);
      upBtn.textContent = '▲';
      upBtn.disabled = idx === 0;
      upBtn.addEventListener('click', () => { swapCategoryOrder(idx, idx - 1); });

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'opre-icon-btn';
      downBtn.setAttribute('aria-label', `Move ${cat.name} down`);
      downBtn.textContent = '▼';
      downBtn.disabled = idx === cats.length - 1;
      downBtn.addEventListener('click', () => { swapCategoryOrder(idx, idx + 1); });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'opre-icon-btn';
      delBtn.setAttribute('aria-label', `Delete ${cat.name}`);
      delBtn.textContent = '🗑';
      delBtn.addEventListener('click', () => deleteCategory(cat.id));

      li.appendChild(nameInput);
      li.appendChild(countSpan);
      li.appendChild(upBtn);
      li.appendChild(downBtn);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }

  function swapCategoryOrder(i, j) {
    const cats = Store.sortedCategories(state.catalogue);
    if (j < 0 || j >= cats.length) return;
    const tmp = cats[i].order;
    cats[i].order = cats[j].order;
    cats[j].order = tmp;
    markDirty();
    renderCategorySidebar();
    renderProductTable();
    renderCategoryFilterOptions();
  }

  async function addCategoryPrompt() {
    const name = await promptDialog('Add category', 'Category name', '');
    if (!name) return;
    const cats = state.catalogue.categories;
    const maxOrder = cats.reduce((m, c) => Math.max(m, c.order), 0);
    cats.push({ id: Store.generateId('cat'), name, order: maxOrder + 1 });
    markDirty();
    renderCategorySidebar();
    renderCategoryFilterOptions();
    renderProductCategorySelectOptions();
  }

  async function deleteCategory(catId) {
    const cat = state.catalogue.categories.find((c) => c.id === catId);
    if (!cat) return;
    const count = state.catalogue.products.filter((p) => p.categoryId === catId).length;
    if (count > 0) {
      await confirmDialog(
        'Cannot delete category',
        `"${cat.name}" still has ${count} product(s). Move or delete them first, then remove this category.`,
        { confirmLabel: 'OK' }
      );
      return;
    }
    const ok = await confirmDialog('Delete category', `Delete the empty category "${cat.name}"? This cannot be undone.`);
    if (!ok) return;
    state.catalogue.categories = state.catalogue.categories.filter((c) => c.id !== catId);
    markDirty();
    renderCategorySidebar();
    renderCategoryFilterOptions();
    renderProductCategorySelectOptions();
  }

  // ---------------- Product table ----------------

  function renderCategoryFilterOptions() {
    const sel = document.getElementById('opre-filter-category');
    const current = sel.value;
    sel.innerHTML = '<option value="">All categories</option>';
    Store.sortedCategories(state.catalogue).forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
    sel.value = current;
  }

  function renderProductCategorySelectOptions() {
    const sel = document.getElementById('p-category');
    sel.innerHTML = '';
    Store.sortedCategories(state.catalogue).forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  }

  function getFilteredProducts() {
    const q = document.getElementById('opre-admin-search').value.trim().toLowerCase();
    const catFilter = document.getElementById('opre-filter-category').value;
    const statusFilter = document.getElementById('opre-filter-status').value;
    return state.catalogue.products.filter((p) => {
      if (catFilter && p.categoryId !== catFilter) return false;
      if (statusFilter === 'active' && !p.active) return false;
      if (statusFilter === 'inactive' && p.active) return false;
      if (q) {
        const hay = `${p.name} ${p.lebaneseName} ${p.format} ${p.notes}`.toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderProductTable() {
    const tbody = document.getElementById('opre-product-tbody');
    tbody.innerHTML = '';
    const filtered = getFilteredProducts();
    const cats = Store.sortedCategories(state.catalogue);
    const catFilter = document.getElementById('opre-filter-category').value;

    cats.forEach((cat) => {
      if (catFilter && cat.id !== catFilter) return;
      const rows = filtered.filter((p) => p.categoryId === cat.id).sort((a, b) => a.order - b.order);
      if (!rows.length) return;

      const groupRow = document.createElement('tr');
      groupRow.className = 'opre-group-row';
      const groupCell = document.createElement('td');
      groupCell.colSpan = 9;
      groupCell.textContent = `${cat.name} (${rows.length})`;
      groupRow.appendChild(groupCell);
      tbody.appendChild(groupRow);

      rows.forEach((p, idxInCat) => {
        tbody.appendChild(buildProductRow(p, idxInCat === 0, idxInCat === rows.length - 1));
      });
    });

    if (!tbody.children.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 9;
      td.textContent = 'No products match your filters.';
      td.style.textAlign = 'center';
      td.style.padding = '24px';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  }

  function buildProductRow(p, isFirstInCat, isLastInCat) {
    const tr = document.createElement('tr');
    tr.dataset.id = p.id;
    if (!p.active) tr.classList.add('is-inactive');

    // Active checkbox
    const tdActive = document.createElement('td');
    const activeCb = document.createElement('input');
    activeCb.type = 'checkbox';
    activeCb.checked = p.active;
    activeCb.setAttribute('aria-label', `${p.name} active`);
    activeCb.addEventListener('change', () => {
      p.active = activeCb.checked;
      p.modifiedDate = Store.todayISO();
      tr.classList.toggle('is-inactive', !p.active);
      markDirty();
    });
    tdActive.appendChild(activeCb);
    tr.appendChild(tdActive);

    tr.appendChild(textCell(p, 'name', 'opre-col-name'));
    tr.appendChild(textCell(p, 'lebaneseName'));
    tr.appendChild(textCell(p, 'format'));

    // Price
    const tdPrice = document.createElement('td');
    tdPrice.className = 'opre-col-price';
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.step = '0.0001';
    priceInput.min = '0';
    priceInput.value = p.price;
    priceInput.setAttribute('aria-label', `${p.name} price`);
    priceInput.addEventListener('change', () => {
      const v = parseFloat(priceInput.value);
      if (!isNaN(v) && v >= 0) { p.price = v; p.modifiedDate = Store.todayISO(); markDirty(); }
      else priceInput.value = p.price;
    });
    tdPrice.appendChild(priceInput);
    tr.appendChild(tdPrice);

    // Basis
    const tdBasis = document.createElement('td');
    const basisSel = document.createElement('select');
    ['item', 'kg', 'ml'].forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b === 'item' ? 'per item' : `per ${b}`;
      if (b === p.priceBasis) opt.selected = true;
      basisSel.appendChild(opt);
    });
    basisSel.setAttribute('aria-label', `${p.name} price basis`);
    basisSel.addEventListener('change', () => { p.priceBasis = basisSel.value; p.modifiedDate = Store.todayISO(); markDirty(); });
    tdBasis.appendChild(basisSel);
    tr.appendChild(tdBasis);

    // Category move
    const tdCat = document.createElement('td');
    const catSel = document.createElement('select');
    Store.sortedCategories(state.catalogue).forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (c.id === p.categoryId) opt.selected = true;
      catSel.appendChild(opt);
    });
    catSel.setAttribute('aria-label', `${p.name} category`);
    catSel.addEventListener('change', () => {
      const targetId = catSel.value;
      const maxOrder = state.catalogue.products
        .filter((x) => x.categoryId === targetId)
        .reduce((m, x) => Math.max(m, x.order), 0);
      p.categoryId = targetId;
      p.order = maxOrder + 1;
      p.modifiedDate = Store.todayISO();
      markDirty();
      renderCategorySidebar();
      renderProductTable();
    });
    tdCat.appendChild(catSel);
    tr.appendChild(tdCat);

    // Order (up/down within category)
    const tdOrder = document.createElement('td');
    tdOrder.className = 'opre-col-order';
    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'opre-icon-btn';
    upBtn.textContent = '▲';
    upBtn.setAttribute('aria-label', `Move ${p.name} up`);
    upBtn.disabled = isFirstInCat;
    upBtn.addEventListener('click', () => moveProductOrder(p, -1));
    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'opre-icon-btn';
    downBtn.textContent = '▼';
    downBtn.setAttribute('aria-label', `Move ${p.name} down`);
    downBtn.disabled = isLastInCat;
    downBtn.addEventListener('click', () => moveProductOrder(p, 1));
    tdOrder.appendChild(upBtn);
    tdOrder.appendChild(downBtn);
    tr.appendChild(tdOrder);

    // Actions
    const tdActions = document.createElement('td');
    tdActions.className = 'opre-col-actions';
    tdActions.appendChild(actionBtn('Edit', () => openProductDialog(p.id)));
    tdActions.appendChild(actionBtn('Duplicate', () => duplicateProduct(p.id)));
    tdActions.appendChild(actionBtn('Delete', () => deleteProduct(p.id)));
    tr.appendChild(tdActions);

    return tr;
  }

  function textCell(p, field, extraClass) {
    const td = document.createElement('td');
    if (extraClass) td.className = extraClass;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = p[field] || '';
    input.setAttribute('aria-label', `${p.name} ${field}`);
    input.addEventListener('change', () => {
      p[field] = input.value;
      p.modifiedDate = Store.todayISO();
      markDirty();
    });
    td.appendChild(input);
    return td;
  }

  function actionBtn(label, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opre-btn secondary';
    btn.style.padding = '4px 8px';
    btn.style.fontSize = '0.78rem';
    btn.style.marginRight = '4px';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function moveProductOrder(p, direction) {
    const siblings = state.catalogue.products
      .filter((x) => x.categoryId === p.categoryId)
      .sort((a, b) => a.order - b.order);
    const idx = siblings.indexOf(p);
    const swapWith = siblings[idx + direction];
    if (!swapWith) return;
    const tmp = p.order;
    p.order = swapWith.order;
    swapWith.order = tmp;
    p.modifiedDate = Store.todayISO();
    markDirty();
    renderProductTable();
  }

  async function deleteProduct(id) {
    const p = state.catalogue.products.find((x) => x.id === id);
    if (!p) return;
    const ok = await confirmDialog('Delete product', `Delete "${p.name}"? This cannot be undone (use "Deactivate" instead if you just want to hide it from customers).`);
    if (!ok) return;
    state.catalogue.products = state.catalogue.products.filter((x) => x.id !== id);
    markDirty();
    renderCategorySidebar();
    renderProductTable();
  }

  function duplicateProduct(id) {
    const p = state.catalogue.products.find((x) => x.id === id);
    if (!p) return;
    const siblings = state.catalogue.products.filter((x) => x.categoryId === p.categoryId);
    const maxOrder = siblings.reduce((m, x) => Math.max(m, x.order), 0);
    const copy = Object.assign({}, p, {
      id: Store.generateId('prod'),
      name: p.name + ' (Copy)',
      order: maxOrder + 1,
      createdDate: Store.todayISO(),
      modifiedDate: Store.todayISO(),
    });
    state.catalogue.products.push(copy);
    markDirty();
    renderCategorySidebar();
    renderProductTable();
    toast(`Duplicated "${p.name}".`);
  }

  // ---------------- Product add/edit dialog ----------------

  function openProductDialog(id) {
    state.editingProductId = id || null;
    renderProductCategorySelectOptions();
    const dlg = document.getElementById('dlg-product');
    const title = document.getElementById('dlg-product-title');
    if (id) {
      const p = state.catalogue.products.find((x) => x.id === id);
      title.textContent = 'Edit product';
      document.getElementById('p-name').value = p.name;
      document.getElementById('p-lebaneseName').value = p.lebaneseName || '';
      document.getElementById('p-format').value = p.format || '';
      document.getElementById('p-description').value = p.description || '';
      document.getElementById('p-category').value = p.categoryId;
      document.getElementById('p-basis').value = p.priceBasis;
      document.getElementById('p-price').value = p.price;
      document.getElementById('p-active').value = String(p.active);
      document.getElementById('p-notes').value = p.notes || '';
      document.getElementById('p-image').value = p.image || '';
    } else {
      title.textContent = 'Add product';
      document.getElementById('form-product').reset();
      const filterCat = document.getElementById('opre-filter-category').value;
      if (filterCat) document.getElementById('p-category').value = filterCat;
      document.getElementById('p-basis').value = 'item';
      document.getElementById('p-active').value = 'true';
    }
    dlg.showModal();
    document.getElementById('p-name').focus();
  }

  document.getElementById('btn-product-cancel').addEventListener('click', () => {
    document.getElementById('dlg-product').close();
  });

  document.getElementById('form-product').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('p-name').value.trim();
    if (!name) return;
    const categoryId = document.getElementById('p-category').value;
    const price = parseFloat(document.getElementById('p-price').value);
    if (isNaN(price) || price < 0) { toast('Please enter a valid price.', true); return; }

    if (state.editingProductId) {
      const p = state.catalogue.products.find((x) => x.id === state.editingProductId);
      p.name = name;
      p.lebaneseName = document.getElementById('p-lebaneseName').value.trim();
      p.format = document.getElementById('p-format').value.trim();
      p.description = document.getElementById('p-description').value.trim();
      p.categoryId = categoryId;
      p.priceBasis = document.getElementById('p-basis').value;
      p.price = price;
      p.active = document.getElementById('p-active').value === 'true';
      p.notes = document.getElementById('p-notes').value.trim();
      p.image = document.getElementById('p-image').value.trim();
      p.modifiedDate = Store.todayISO();
    } else {
      const maxOrder = state.catalogue.products
        .filter((x) => x.categoryId === categoryId)
        .reduce((m, x) => Math.max(m, x.order), 0);
      state.catalogue.products.push({
        id: Store.generateId('prod'),
        categoryId,
        name,
        lebaneseName: document.getElementById('p-lebaneseName').value.trim(),
        description: document.getElementById('p-description').value.trim(),
        format: document.getElementById('p-format').value.trim(),
        price,
        currency: 'USD',
        priceBasis: document.getElementById('p-basis').value,
        order: maxOrder + 1,
        active: document.getElementById('p-active').value === 'true',
        image: document.getElementById('p-image').value.trim(),
        notes: document.getElementById('p-notes').value.trim(),
        createdDate: Store.todayISO(),
        modifiedDate: Store.todayISO(),
      });
    }
    document.getElementById('dlg-product').close();
    markDirty();
    renderCategorySidebar();
    renderProductTable();
  });

  // ---------------- Settings tab ----------------

  function renderSettings() {
    const s = state.catalogue.settings;
    document.getElementById('opre-public-url').value = s.publicCatalogueUrl || '';
    document.getElementById('s-companyName').value = s.companyName || '';
    document.getElementById('s-tagline').value = s.tagline || '';
    document.getElementById('s-address').value = s.address || '';
    document.getElementById('s-phone').value = s.phone || '';
    document.getElementById('s-email').value = s.email || '';
    document.getElementById('s-website').value = s.website || '';
    document.getElementById('s-instagram').value = s.instagram || '';
    document.getElementById('s-aboutText').value = s.aboutText || '';
    document.getElementById('s-pricingNotice').value = s.pricingNotice || '';
    updateUrlStatus();
  }

  function updateUrlStatus() {
    const url = document.getElementById('opre-public-url').value.trim();
    const status = document.getElementById('opre-url-status');
    const qrBox = document.getElementById('opre-settings-qr');
    if (!url) {
      status.textContent = 'No public URL configured — the QR code will be hidden from the exported catalogue and public page until you set one.';
      status.className = 'opre-url-status warn';
      qrBox.innerHTML = '';
      return;
    }
    if (Store.isPublicUrlValid(url)) {
      status.textContent = 'Valid public URL. QR code will be included in the public catalogue and PDF export.';
      status.className = 'opre-url-status ok';
      QR.renderQRCode(qrBox, url);
    } else {
      status.textContent = 'This does not look like a public http(s) URL (localhost / file paths are not allowed). QR code will be hidden.';
      status.className = 'opre-url-status warn';
      qrBox.innerHTML = '';
    }
  }

  [
    ['opre-public-url', 'publicCatalogueUrl'],
    ['s-companyName', 'companyName'],
    ['s-tagline', 'tagline'],
    ['s-address', 'address'],
    ['s-phone', 'phone'],
    ['s-email', 'email'],
    ['s-website', 'website'],
    ['s-instagram', 'instagram'],
    ['s-aboutText', 'aboutText'],
    ['s-pricingNotice', 'pricingNotice'],
  ].forEach(([elId, field]) => {
    document.getElementById(elId).addEventListener('change', () => {
      state.catalogue.settings[field] = document.getElementById(elId).value;
      markDirty();
      if (elId === 'opre-public-url') updateUrlStatus();
    });
  });
  document.getElementById('opre-public-url').addEventListener('input', updateUrlStatus);

  // ---------------- Live preview ----------------

  function refreshPreview() {
    try {
      sessionStorage.setItem('opre-preview-catalogue', JSON.stringify(state.catalogue));
    } catch (err) { /* ignore quota errors for preview */ }
    const frame = document.getElementById('opre-preview-frame');
    if (frame && !frame.dataset.loaded) return; // will load on first tab activation
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: 'opre-preview-update' }, '*');
    }
  }

  // ---------------- Tabs ----------------

  const tabButtons = {
    products: document.getElementById('tab-btn-products'),
    preview: document.getElementById('tab-btn-preview'),
    settings: document.getElementById('tab-btn-settings'),
  };
  const tabPanels = {
    products: document.getElementById('tab-products'),
    preview: document.getElementById('tab-preview'),
    settings: document.getElementById('tab-settings'),
  };
  function activateTab(name) {
    Object.keys(tabButtons).forEach((k) => {
      const active = k === name;
      tabButtons[k].classList.toggle('is-active', active);
      tabButtons[k].setAttribute('aria-selected', String(active));
      tabPanels[k].hidden = !active;
    });
    if (name === 'preview') {
      const frame = document.getElementById('opre-preview-frame');
      if (!frame.dataset.loaded) {
        try { sessionStorage.setItem('opre-preview-catalogue', JSON.stringify(state.catalogue)); } catch (err) {}
        frame.src = 'index.html?preview=1';
        frame.dataset.loaded = '1';
      }
    }
  }
  tabButtons.products.addEventListener('click', () => activateTab('products'));
  tabButtons.preview.addEventListener('click', () => activateTab('preview'));
  tabButtons.settings.addEventListener('click', () => activateTab('settings'));

  // ---------------- Toolbar wiring ----------------

  document.getElementById('opre-admin-search').addEventListener('input', renderProductTable);
  document.getElementById('opre-filter-category').addEventListener('change', renderProductTable);
  document.getElementById('opre-filter-status').addEventListener('change', renderProductTable);
  document.getElementById('btn-add-product').addEventListener('click', () => openProductDialog(null));
  document.getElementById('btn-add-category').addEventListener('click', addCategoryPrompt);

  document.getElementById('btn-open-public').addEventListener('click', () => window.open('index.html', '_blank'));
  document.getElementById('btn-open-print').addEventListener('click', () => window.open('print.html', '_blank'));

  document.getElementById('btn-save').addEventListener('click', () => {
    state.catalogue.settings.catalogueUpdatedDate = Store.formatUpdatedDate();
    Store.saveCatalogue(state.catalogue);
    clearDirty();
    toast('Catalogue saved.');
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    Store.exportJSON(state.catalogue);
    toast('JSON export downloaded.');
  });
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    Store.exportCSV(state.catalogue);
    toast('CSV export downloaded.');
  });
  document.getElementById('btn-import-json').addEventListener('click', () => {
    document.getElementById('opre-import-file').click();
  });
  document.getElementById('opre-import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await Store.importJSONFile(file);
      const ok = await confirmDialog('Import catalogue', `Replace the current catalogue with "${file.name}"? Unsaved changes will be lost. This takes effect after you click Save.`, { confirmLabel: 'Import' });
      if (!ok) return;
      state.catalogue = data;
      renderAll();
      markDirty();
      toast('Catalogue imported. Review and click "Save changes" to keep it.');
    } catch (err) {
      toast(err.message, true);
    } finally {
      e.target.value = '';
    }
  });

  document.getElementById('btn-reset').addEventListener('click', async () => {
    const ok = await confirmDialog(
      'Reset to original catalogue',
      'This permanently discards ALL edits made in this admin app (products, categories, prices, settings) and restores the original 184-product catalogue imported from the source PDF. This cannot be undone. Continue?',
      { confirmLabel: 'Reset everything' }
    );
    if (!ok) return;
    state.catalogue = Store.resetToOriginal();
    renderAll();
    clearDirty();
    toast('Catalogue reset to original.');
  });

  // ---------------- Init ----------------

  function renderAll() {
    renderCategorySidebar();
    renderCategoryFilterOptions();
    renderProductCategorySelectOptions();
    renderProductTable();
    renderSettings();
  }

  renderAll();
})();
