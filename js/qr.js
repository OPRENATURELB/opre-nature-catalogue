// OPRE NATURE — QR code helper
// Wraps the vendored vendor/qrcode.js (plain <script>, exposes window.qrcode).
// Never renders a QR code for a localhost / file:// address — see Opre.Store.isPublicUrlValid().
// Plain classic script — exposes window.Opre.QR. Load after data-store.js and vendor/qrcode.js.
(function (global) {
  'use strict';

  function renderQRCode(container, url, opts) {
    opts = opts || {};
    const cellSize = opts.cellSize || 5;
    const margin = opts.margin === undefined ? 2 : opts.margin;
    container.innerHTML = '';
    if (!global.Opre.Store.isPublicUrlValid(url)) return false;
    if (typeof global.qrcode !== 'function') {
      console.error('QR library (vendor/qrcode.js) not loaded.');
      return false;
    }
    const qr = global.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    container.innerHTML = qr.createSvgTag({ cellSize, margin, scalable: true });
    const svg = container.querySelector('svg');
    if (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', `QR code linking to ${url}`);
    }
    return true;
  }

  global.Opre = global.Opre || {};
  global.Opre.QR = { renderQRCode };
})(window);
