# OPRE NATURE — Catalogue Import Validation Report

Generated during import on 2026-08-18.

## Sources

- **Excel inventory**: `Inventory_Table_Rearranged.xlsx` (sheet "Inventory"), 190 data rows (2 columns: Product Description, Selling Price), read via Excel COM automation (no categories, no ordering — a flat price list).
- **PDF catalogue**: `OPRE_NATURE_Product_Catalogue_Draft.pdf`, 17 pages, extracted with `pdftotext -layout`. Used as the **definitive** source for category assignment, cleaned product names, display order, and price formatting/basis, per instructions.

## Result: PASS

| Check | Result |
|---|---|
| Total active customer-facing products | **184** ✅ (required: 184) |
| Every product has a category | ✅ all 184 assigned directly from the PDF's own category pages |
| Every product has a numeric price | ✅ all 184 |
| Category counts match approved list | ✅ see table below |
| Duplicate product names | **0** found |
| Products in Excel not matched to a PDF entry | **0** (all 6 unmatched Excel rows are confirmed internal/non-customer items, listed below) |
| Excluded internal items present in final catalogue | **0** — confirmed absent |

## Category counts

| # | Category | Required | Imported |
|---|---|---|---|
| 1 | Olive Oils & Vegetable Oils | 17 | 17 |
| 2 | Honey & Bee Products | 10 | 10 |
| 3 | Tahini, Sesame, Zaatar & Sumac | 20 | 20 |
| 4 | Olives | 19 | 19 |
| 5 | Pickles & Preserved Vegetables | 26 | 26 |
| 6 | Molasses, Vinegars & Natural Acids | 17 | 17 |
| 7 | Jams & Fruit Preserves | 5 | 5 |
| 8 | Traditional Syrups & Floral Waters | 18 | 18 |
| 9 | Dried Fruits, Dates & Nuts | 19 | 19 |
| 10 | Tomato Products & Sauces | 19 | 19 |
| 11 | Traditional Liqueurs | 6 | 6 |
| 12 | Gift Boxes | 4 | 4 |
| 13 | Other Traditional Specialities | 4 | 4 |
| | **Total** | **184** | **184** |

## Reconciliation: Excel (190 rows) → Final catalogue (184 products)

190 Excel rows − 6 excluded internal/non-customer rows = **184**, an exact match with no unaccounted or ambiguous rows.

### Excluded rows (confirmed internal, not customer-facing — absent from the PDF and from the final catalogue)

| Excel row | Excel price | Reason |
|---|---|---|
| Aramex Delivery | $6.00 | Courier/delivery line item, not a product |
| designer | $30.00 | Internal design/labour cost line item |
| Empty Pail | $2.25 | Packaging component, not a sellable product |
| Bag Craft | $6.50 | Packaging component |
| Gallon Plastic 5L | $0.35 | Empty container component |
| Bottele plastic 1L | $0.21 | Empty container component |

Note: several *products* legitimately include "Plastic Gallon" in their name (e.g. "Mustard US Plastic Gallon 4.2 kg", "BBQ Sauce Plastic Gallon 4.2 kg") — these are professional bulk formats sold by weight and were correctly **kept**, distinct from the excluded standalone empty-container SKUs above.

## Price reconciliation notes (Excel raw price vs. PDF displayed price)

The PDF price is used as the definitive, displayed value (per instructions). Differences below are rounding only — no pricing errors found:

| Product | Excel raw | PDF displayed | Note |
|---|---|---|---|
| Olive oil nice food 500 ml | 2.2916 | $2.29 | standard rounding |
| Olive oil nice food 750 ml | 3.4375 | $3.44 | standard rounding |
| Tahini (Thineh) 800 g | 3.333 | $3.33 | standard rounding |
| Olives Black pail zero 10 kg | 4.8888 /kg | $4.89 / kg | standard rounding |
| Pickles ziczac pail 10 kg | 1.3333 /kg | $1.33 / kg | standard rounding |
| Mustard US Plastic Gallon 4.2 kg | 8.625 /kg | $8.62 / kg | PDF rounds down instead of to $8.63; used PDF's definitive value as instructed |

All other prices match exactly between the two sources.

## Price basis

Every product marked "/ kg" or "/ ml" in the PDF was imported with `priceBasis` set accordingly (`kg` or `ml`); all others use `item`. Bulk professional formats (10 kg pails, plastic gallons, tanks) are correctly priced per kg or per ml; retail single-unit formats are priced per item.

## Ambiguity / items flagged for owner review

None. Every Excel row either matched a PDF product 1:1 or was a confirmed internal exclusion. No product was invented, merged, or reclassified by guesswork.
