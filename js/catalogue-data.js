// OPRE NATURE — seed catalogue data
// Source of truth: OPRE_NATURE_Product_Catalogue_Draft.pdf (categories, product names/order, prices, price basis)
// Cross-checked against Inventory_Table_Rearranged.xlsx (raw prices) — see VALIDATION_REPORT.md
// This file is only the ORIGINAL seed. Live edits made in the admin app are stored in localStorage
// and layered on top of this — see js/data-store.js. "Reset to original" restores exactly this file.
//
// Plain classic script (no ES modules) so the app runs from a double-clicked file:// HTML file
// with no local server required. Exposes everything on window.Opre.Data.
(function (global) {
  'use strict';

  const ORIGINAL_CATEGORIES = [
    { id: 'oils', name: 'Olive Oils & Vegetable Oils', order: 1 },
    { id: 'honey', name: 'Honey & Bee Products', order: 2 },
    { id: 'tahini-zaatar', name: 'Tahini, Sesame, Zaatar & Sumac', order: 3 },
    { id: 'olives', name: 'Olives', order: 4 },
    { id: 'pickles', name: 'Pickles & Preserved Vegetables', order: 5 },
    { id: 'molasses-vinegars', name: 'Molasses, Vinegars & Natural Acids', order: 6 },
    { id: 'jams', name: 'Jams & Fruit Preserves', order: 7 },
    { id: 'syrups-waters', name: 'Traditional Syrups & Floral Waters', order: 8 },
    { id: 'dried-fruits', name: 'Dried Fruits, Dates & Nuts', order: 9 },
    { id: 'tomato', name: 'Tomato Products & Sauces', order: 10 },
    { id: 'liqueurs', name: 'Traditional Liqueurs', order: 11 },
    { id: 'gift-boxes', name: 'Gift Boxes', order: 12 },
    { id: 'other', name: 'Other Traditional Specialities', order: 13 },
  ];

  // [ name (verbatim from PDF "PRODUCT / FORMAT" column), price, priceBasis ]
  const RAW = {
    oils: [
      ['Olive oil 1.5 L', 16.00, 'item'],
      ['Olive oil 500 ml', 5.50, 'item'],
      ['Olive oil 750 ml', 8.25, 'item'],
      ['Olive Oil 8 kg', 77.00, 'item'],
      ['Olive oil Extra Virgin 16KG', 153.00, 'item'],
      ['Olive oil Extra Virgin 3L', 31.50, 'item'],
      ['Olive oil nice food 1.5 L', 6.75, 'item'],
      ['Olive oil nice food 3L', 13.50, 'item'],
      ['Olive oil nice food 500 ml', 2.29, 'item'],
      ['Olive oil nice food 750 ml', 3.44, 'item'],
      ['Olive Oil Regular 16 kg', 75.00, 'item'],
      ['Olive oil tank 17 L', 0.0090, 'ml'],
      ['Sunflower 700 ml', 1.29, 'item'],
      ['Sunflower oil 1.8 L', 3.50, 'item'],
      ['Sunflower oil 6 L', 10.60, 'item'],
      ['Sunflower oil 900 ml', 2.00, 'item'],
      ['Sunflower oil 9L', 0.0018, 'ml'],
    ],
    honey: [
      ['Creamy Honey 500 g', 18.50, 'item'],
      ['Honey Wax', 25.00, 'item'],
      ['Oak Honey 1 kg', 33.00, 'item'],
      ['Oak Honey 450 g', 8.00, 'item'],
      ['Oak Honey 500g', 15.25, 'item'],
      ['Oak Honey 850 g', 15.00, 'item'],
      ['Pollen 225 g', 10.50, 'item'],
      ['Pollen 450 g', 20.00, 'item'],
      ['Propolis drop 15 g', 15.00, 'item'],
      ['Royal jelly', 20.00, 'item'],
    ],
    'tahini-zaatar': [
      ['Sesame', 9.00, 'item'],
      ['Sesame 250g', 2.50, 'item'],
      ['Sesame 500g', 5.00, 'item'],
      ['Sesame nay ma2shour', 3.50, 'item'],
      ['Sesame raw', 3.00, 'item'],
      ['Sumac', 17.00, 'item'],
      ['Sumac 250', 4.50, 'item'],
      ['Sumac 500', 9.00, 'item'],
      ['Tahini (Thineh) 400g - piece', 1.95, 'item'],
      ['Tahini (Thineh) 400g box', 23.40, 'item'],
      ['Tahini (Thineh) 800 g', 3.33, 'item'],
      ['Tahini (Thineh) Extra 9 kg', 32.50, 'item'],
      ['Tahini (Thineh) Extra pail 18 kg', 80.00, 'item'],
      ['Tahini (Thineh) pail 4 kg', 17.50, 'item'],
      ['Tahini (Thineh) Pail kg', 4.00, 'kg'],
      ['Zaatar kham', 8.50, 'item'],
      ['Zaatar Mix 1 kg', 8.50, 'item'],
      ['Zaatar Mix 250', 2.75, 'item'],
      ['Zaatar Mix 500', 5.50, 'item'],
      ['ZAATAR 250', 2.50, 'item'],
    ],
    olives: [
      ['Olives black 650 g', 2.75, 'item'],
      ['Olives Black pail zero 10 kg', 4.89, 'kg'],
      ['Olives black sliced 650 g', 2.75, 'item'],
      ['Olives black sliced 650 g + oil', 4.75, 'item'],
      ['Olives black/green 650 + oil', 4.75, 'item'],
      ['Olives green 650 g', 2.75, 'item'],
      ['Olives grilled Salad 650 g', 2.75, 'item'],
      ['Olives Pail black 10 kg', 4.20, 'kg'],
      ['Olives Pail green 10 kg', 4.20, 'kg'],
      ['Olives Pail sliced 10 kg', 4.20, 'kg'],
      ['Olives Spanish grilled 650 g', 2.75, 'item'],
      ['Olives Spanish Grilled kg', 4.50, 'kg'],
      ['Olives stuffed 7arr 650 g', 3.50, 'item'],
      ['Olives stuffed almonds 650 g', 3.50, 'item'],
      ['Olives Stuffed Mix pail kg', 5.50, 'kg'],
      ['Olives stuffed walnut 650 g', 3.50, 'item'],
      ['Olivese black 1 kg', 4.20, 'kg'],
      ['Olivese Sliced 1 kg', 4.00, 'kg'],
      ['Zeitoun green pail zero 10kg', 45.00, 'item'],
    ],
    pickles: [
      ['7arr Gazal 5 kg', 10.00, 'item'],
      ['7arr Gazal 7 kg', 2.00, 'item'],
      ['7arr pail Rafi3 5 kg', 12.50, 'kg'],
      ['Cornichon 620g', 2.50, 'item'],
      ['Cornichons Pail 10 kg', 4.00, 'kg'],
      ['Left 7abb pail 10 kg', 10.00, 'kg'],
      ['Left mcharra7 pail 10 kg', 15.00, 'kg'],
      ['Makdous 560g', 4.75, 'item'],
      ['Makdous pail 10 kg', 5.00, 'kg'],
      ['Makdouss pail 10 kg +walnut', 5.50, 'kg'],
      ['Me2tti mchara7 pail 10 kg', 10.00, 'kg'],
      ['Pickles 7ar Gazal 500g', 1.75, 'item'],
      ['Pickles khiar 620g', 1.75, 'item'],
      ['Pickles Khiar mchara7 Pail 10 kg', 11.00, 'kg'],
      ['Pickles Khiar zahra Pail 10 kg', 22.00, 'item'],
      ['Pickles khiar zikzak pail 10 kg', 12.00, 'kg'],
      ['Pickles Mchakal 90g', 0.21, 'item'],
      ['Pickles mchakal Pail 10 kg', 12.00, 'kg'],
      ['Pickles mchakkal 620 g', 1.50, 'item'],
      ['Pickles Me2ti mchrra7 10kg', 2.20, 'item'],
      ['Pickles me2tti 620 g', 1.75, 'item'],
      ['Pickles me2tti zahra pail 10 k', 2.20, 'kg'],
      ['Pickles ziczac pail 10 kg', 1.33, 'kg'],
      ['Warak 3arish 550 g', 3.75, 'item'],
      ['Warak Enab 1kg', 4.00, 'item'],
      ['Warak Enab pail 10 kg', 4.20, 'kg'],
    ],
    'molasses-vinegars': [
      ['Debs Kharroub (Carob Molasses) 1 kg', 4.00, 'item'],
      ['Debs Kharroub (Carob Molasses) 500 g', 2.25, 'item'],
      ['Debs Remman (Pomegranate Molasses) 250ml', 2.00, 'item'],
      ['Debs Remman (Pomegranate Molasses) 500 ml', 3.75, 'item'],
      ['Debs Remman (Pomegranate Molasses) gallon 6.25 kg', 2.88, 'kg'],
      ['Debs Tamer (Date Molasses) 1 kg', 5.75, 'item'],
      ['Debs Tamer (Date Molasses) 500g', 3.00, 'item'],
      ['Hamod el Hosrom (Verjuice) 250 ml', 2.50, 'item'],
      ['Hamod el Hosrom (Verjuice) 500 ml', 4.75, 'item'],
      ['Khal el Assal 750 ml', 8.00, 'item'],
      ['Natural Apple Vinegar 375 ml', 1.75, 'item'],
      ['Natural Apple Vinegar 750 ml', 2.75, 'item'],
      ['Natural Apple Vinegar kg', 2.50, 'kg'],
      ['Natural Debs Remman (Pomegranate Molasses) 1 kg', 11.00, 'item'],
      ['Red Vinegar Nice Food 1 L', 0.55, 'item'],
      ['White vinegar gallon Nice Food 5L', 2.00, 'kg'],
      ['White Vinegar Nice food 1L', 0.50, 'item'],
    ],
    jams: [
      ['Apricot jam 650 g', 2.75, 'item'],
      ['Black Mulbery Jam 650 g', 2.75, 'item'],
      ['Fig jam 650 g', 3.00, 'item'],
      ['Mulberry jam 650 g', 2.75, 'item'],
      ['Strawberry jam 650g', 2.75, 'item'],
    ],
    'syrups-waters': [
      ['Kas3in 250 ml', 2.30, 'item'],
      ['Kas3in 500 ml', 4.25, 'item'],
      ['Ma2 el Wared (Rose Water)', 0.0060, 'ml'],
      ['Ma2 el Wared (Rose Water) 250 ml', 4.00, 'item'],
      ['Ma2 el Wared (Rose Water) 500 ml', 8.00, 'item'],
      ['Ma2 el Zaher (Orange Blossom Water) 250 ml', 5.25, 'item'],
      ['Ma2 el Zaher (Orange Blossom Water) 500 ml', 10.00, 'item'],
      ['Sharab Boussfeir (Bitter Orange Syrup) 750 ml', 6.00, 'item'],
      ['Sharab boussfeir 500 ml', 4.00, 'item'],
      ['Sharab boussfeir kg', 4.00, 'kg'],
      ['Sharab el Tout (Mulberry Syrup)', 0.0050, 'ml'],
      ['Sharab el Tout (Mulberry Syrup) 500 ml', 7.50, 'item'],
      ['Sharab el Tout (Mulberry Syrup) 750 ml', 11.00, 'item'],
      ['Sharab el Tout (Mulberry Syrup) kg', 6.00, 'kg'],
      ['Sharab el Wared (Rose Syrup)', 0.0060, 'ml'],
      ['Sharab el Wared (Rose Syrup) 500 ml', 7.50, 'item'],
      ['Sharab el Wared (Rose Syrup) 750 ml', 11.00, 'item'],
      ['Sharab el Wared (Rose Syrup) kg', 6.00, 'kg'],
    ],
    'dried-fruits': [
      ['Almond', 12.00, 'item'],
      ['Coconut crushed 1 kg', 9.00, 'item'],
      ['Coconut crushed 250 g', 2.50, 'item'],
      ['Crushed Date ready', 1.20, 'item'],
      ['Crushed dates 600g', 3.25, 'item'],
      ['Date khodary Extra 1kg', 6.25, 'item'],
      ['Date khodary extra 500g', 3.25, 'item'],
      ['Date Medjoul', 14.00, 'item'],
      ['Dried Apricot', 20.00, 'item'],
      ['Dried Cranberry', 16.00, 'item'],
      ['Dried fig', 18.00, 'item'],
      ['Dried figs', 16.00, 'item'],
      ['Dried fruits Decorated 650g', 10.75, 'item'],
      ['Dried fruits Decoreted 830g', 13.25, 'item'],
      ['Dried Prune', 13.00, 'item'],
      ['Pistachio', 30.00, 'item'],
      ['Raisin 1kg', 9.00, 'item'],
      ['Raisin 250g', 2.50, 'item'],
      ['Walnut', 12.00, 'item'],
    ],
    tomato: [
      ['BBQ Sauce Plastic Gallon 4.2 kg', 7.62, 'kg'],
      ['Chicken Wings Plastic Gallon 2.2 kg', 4.00, 'kg'],
      ['Ketchup 340 g', 1.15, 'item'],
      ['Ketchup Plastic Gallon 4.2 kg', 4.75, 'kg'],
      ['Mayonnaise Classic US Plastic Gallon 3.8 kg', 10.00, 'kg'],
      ['Mayonnaise Heavy US Plastic Gallon 3.8 kg', 11.75, 'kg'],
      ['Mustard US Plastic Gallon 4.2 kg', 8.62, 'kg'],
      ['Pasta Sauce 2.750 kg', 3.50, 'kg'],
      ['Pizza Sauce Fine Herbs 300 g', 2.00, 'item'],
      ['Pizza sauce Fine Herbs 370 g', 2.25, 'item'],
      ['Pizza Sauce Green Pepper 300 g', 2.00, 'item'],
      ['Pizza Sauce Green Pepper 370 g', 2.25, 'item'],
      ['Sweet & chilli Plastic Gallon 2.2 kg', 4.00, 'kg'],
      ['Sweet & sour Plastic Gallon 2.2 kg', 4.00, 'kg'],
      ['Tomato Paste 1100g 12(pieces)', 2.60, 'item'],
      ['Tomato Paste 1300 g', 3.00, 'item'],
      ['Tomato paste 300g', 1.75, 'item'],
      ['Tomato Paste 650 g', 1.50, 'item'],
      ['Tomato Paste Opre 660 g', 3.00, 'item'],
    ],
    liqueurs: [
      ['Liquor/ Apple 250 ml', 4.25, 'item'],
      ['Liquor/ Apple 500 ml', 8.00, 'item'],
      ['Liquor/ Cherry 250 ml', 4.25, 'item'],
      ['Liquor/ Cherry 500 ml', 8.00, 'item'],
      ['Liquor/ Myrtle Henbless 250 ml', 4.25, 'item'],
      ['Liquor/ Myrtle Henbless 500 ml', 8.00, 'item'],
    ],
    'gift-boxes': [
      ['Coffret Large Creamy Honey', 85.00, 'item'],
      ['Coffret Large Pollen', 85.00, 'item'],
      ['Coffret Small Creamy Honey', 50.00, 'item'],
      ['Coffret small Pollen', 50.00, 'item'],
    ],
    other: [
      ['7ar shatta', 3.00, 'item'],
      ['Mashrouk 400', 1.00, 'item'],
      ['Mashrouk 800g', 2.00, 'item'],
      ['Mashrouk box', 10.00, 'item'],
    ],
  };

  const CATEGORY_DESCRIPTIONS = {
    oils: 'Naturally pressed oil from our fields, bottled in retail and professional formats.',
    honey: 'Pure, naturally harvested bee product from local hives.',
    'tahini-zaatar': 'Stone-ground sesame paste and traditional herb blends, prepared the homemade way.',
    olives: 'Hand-cured Lebanese olives, prepared using traditional methods.',
    pickles: 'Traditional Lebanese pickled vegetables, naturally preserved.',
    'molasses-vinegars': 'Traditional Lebanese molasses and natural acids, slow-reduced by hand.',
    jams: 'Homemade fruit preserve, cooked slowly the traditional way.',
    'syrups-waters': 'Traditional Lebanese floral water or syrup, distilled and prepared naturally.',
    'dried-fruits': 'Naturally dried fruit, date or nut — a traditional Lebanese pantry staple.',
    tomato: 'Traditional homemade tomato-based sauce or condiment.',
    liqueurs: 'Traditional Lebanese homemade liqueur, infused the artisanal way.',
    'gift-boxes': 'A curated OPRE NATURE gift set, ready for sharing.',
    other: 'A traditional OPRE NATURE specialty, prepared the homemade way.',
  };

  const SIZE_RE = /(\d+(?:[.,]\d+)?\s?(?:ml|mL|ML|l|L|kg|KG|Kg|g|G))(?:\s*[-(].*)?$/;

  function deriveFormat(name) {
    const cleaned = name.replace(/\s*\+\s*(oil|walnut)\s*$/i, '').trim();
    const m = cleaned.match(SIZE_RE);
    return m ? m[1].replace(/\s+/g, ' ').trim() : '';
  }

  function deriveLebaneseName(name) {
    // Only treat "Lebanese Term (English gloss) 500 g" as a translation pair —
    // requires a space before "(" (excludes glued annotations like "12(pieces)")
    // and rejects digits on either side (excludes size/count fragments).
    const m = name.match(/^([^(0-9]+?)\s\(([^)0-9]+)\)/);
    if (!m) return '';
    // The PDF writes most pairs as "Lebanese Term (English gloss)" but Tahini
    // as "Tahini (Thineh)" — English first. Detect and use the Lebanese side.
    if (m[2].trim().toLowerCase() === 'thineh') return m[2].trim();
    return m[1].trim();
  }

  function slugify(name, index) {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 40) +
      '-' +
      String(index).padStart(3, '0')
    );
  }

  function buildProducts() {
    const products = [];
    const importDate = '2026-08-18';
    ORIGINAL_CATEGORIES.forEach((cat) => {
      const rows = RAW[cat.id] || [];
      rows.forEach((row, i) => {
        const [name, price, priceBasis] = row;
        products.push({
          id: slugify(name, i + 1) + '-' + cat.id,
          categoryId: cat.id,
          name,
          lebaneseName: deriveLebaneseName(name),
          description: CATEGORY_DESCRIPTIONS[cat.id] || '',
          format: deriveFormat(name),
          price,
          currency: 'USD',
          priceBasis, // 'item' | 'kg' | 'ml'
          order: i + 1,
          active: true,
          image: '',
          notes: '',
          createdDate: importDate,
          modifiedDate: importDate,
        });
      });
    });
    return products;
  }

  function importFormattedDate() {
    const d = new Date('2026-08-18T00:00:00');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  const ORIGINAL_PRODUCTS = buildProducts();

  const ORIGINAL_SETTINGS = {
    publicCatalogueUrl: '',
    currency: 'USD',
    catalogueUpdatedDate: importFormattedDate(),
    companyName: 'OPRE NATURE',
    tagline: 'Hand Made Natural Products',
    subTagline: 'From Our Fields to Your Table',
    address: 'Fidar, Lebanon - 508 Str.',
    phone: '+961 3 965708',
    email: 'oprenature@gmail.com',
    website: 'www.oprenature.com',
    instagram: '@oprenature',
    aboutText:
      "Opré means ‘in the fields,’ a name that reflects our deep connection to the land, local agriculture and traditional Lebanese food.\n\nAt OPRE NATURE, our products are carefully prepared with passion using locally cultivated ingredients and time-honoured homemade methods. From olive oil, honey and zaatar to preserves, molasses, dried fruits and traditional specialties, every product celebrates authentic flavour and the generosity of our fields.\n\nWe are committed to offering natural, carefully crafted products that bring the warmth and authenticity of Lebanese homemade food to every table.\n\nAll OPRE NATURE products are gluten-free.",
    pricingNotice:
      'All prices are in USD and include VAT. Prices are subject to change; please contact us for the latest update. Prices marked “/ kg” or “/ ml” are unit prices for the indicated professional format.',
  };

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
