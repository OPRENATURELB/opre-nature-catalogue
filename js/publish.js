// OPRE NATURE — one-click publish to GitHub Pages
// Regenerates js/catalogue-data.js from the current in-browser catalogue and pushes it
// straight to GitHub via the Contents API, so the admin never has to export/import JSON
// by hand. Requires a GitHub personal access token scoped to just this one repo
// ("Contents: Read and write") — see the Settings tab for where that's entered.
// The token is stored in this browser's localStorage only, under its own key
// (never inside catalogue exports), and is only ever sent directly to api.github.com.
(function (global) {
  'use strict';

  const TOKEN_KEY = 'opre-github-publish-config-v1';

  function loadPublishConfig() {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      return raw ? JSON.parse(raw) : { owner: 'OPRENATURELB', repo: 'opre-nature-catalogue', branch: 'master', path: 'js/catalogue-data.js', token: '' };
    } catch {
      return { owner: 'OPRENATURELB', repo: 'opre-nature-catalogue', branch: 'master', path: 'js/catalogue-data.js', token: '' };
    }
  }

  function savePublishConfig(cfg) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(cfg));
  }

  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary);
  }

  // Mirrors the structure hand-written in js/catalogue-data.js so a published
  // file is indistinguishable from one edited directly in the repo.
  function buildCatalogueDataJs(catalogue) {
    const categoriesJson = JSON.stringify(catalogue.categories, null, 2);
    const productsJson = JSON.stringify(catalogue.products, null, 2);
    const settingsJson = JSON.stringify(catalogue.settings, null, 2);
    return `// OPRE NATURE — catalogue data
// Published automatically from the admin dashboard (Settings > Publish to GitHub).
// This is the LIVE catalogue: the public site, print/PDF export, and "Reset to original"
// in the admin dashboard all use this as the canonical baseline.
//
// Plain classic script (no ES modules) so the app runs from a double-clicked file:// HTML file
// with no local server required. Exposes everything on window.Opre.Data.
(function (global) {
  'use strict';

  const ORIGINAL_CATEGORIES = ${categoriesJson};

  const ORIGINAL_PRODUCTS = ${productsJson};

  const ORIGINAL_SETTINGS = ${settingsJson};

  const ORIGINAL_CATALOGUE = {
    categories: ORIGINAL_CATEGORIES,
    products: ORIGINAL_PRODUCTS,
    settings: ORIGINAL_SETTINGS,
  };

  global.Opre = global.Opre || {};
  global.Opre.Data = {
    ORIGINAL_CATEGORIES,
    ORIGINAL_PRODUCTS,
    ORIGINAL_SETTINGS,
    ORIGINAL_CATALOGUE,
  };
})(window);
`;
  }

  async function publishCatalogue(catalogue, cfg, onStatus) {
    const { owner, repo, branch, path, token } = cfg;
    if (!owner || !repo || !token) {
      throw new Error('Repo owner, repo name and access token are all required.');
    }
    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    };

    onStatus && onStatus('Checking current file on GitHub…');
    const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, { headers });
    let sha;
    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
    } else if (getRes.status === 401) {
      throw new Error('GitHub rejected the token (401 Unauthorized). Check it was copied correctly and hasn’t expired.');
    } else if (getRes.status === 404) {
      sha = undefined; // file doesn't exist yet — will be created
    } else if (getRes.status !== 404) {
      throw new Error(`Could not read the current file from GitHub (HTTP ${getRes.status}). Check the repo owner/name and that the token has access.`);
    }

    onStatus && onStatus('Uploading updated catalogue…');
    const content = buildCatalogueDataJs(catalogue);
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Publish catalogue update from admin dashboard (${new Date().toISOString()})`,
        content: utf8ToBase64(content),
        sha,
        branch,
      }),
    });
    if (!putRes.ok) {
      let detail = '';
      try { detail = (await putRes.json()).message || ''; } catch {}
      throw new Error(`GitHub rejected the update (HTTP ${putRes.status}). ${detail}`);
    }
    const result = await putRes.json();
    onStatus && onStatus('Published. GitHub Pages will rebuild in about 30–60 seconds.');
    return result;
  }

  global.Opre = global.Opre || {};
  global.Opre.Publish = { loadPublishConfig, savePublishConfig, publishCatalogue, buildCatalogueDataJs };
})(window);
