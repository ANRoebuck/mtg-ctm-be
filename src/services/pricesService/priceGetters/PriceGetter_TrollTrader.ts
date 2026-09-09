import AbstractScrapingDataGetter from './AbstractScrapingDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Troll Trader';
const baseUrl = 'https://www.trolltradercards.com';

class PriceGetter_TrollTrader extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Troll_Trader_logo_new_600x240.png',
            dataGetter: new ScrapingDataGetter_TrollTrader(),
            dataProcessor: new DataProcessor_TrollTrader(),
        });
    }
}

// Troll Trader migrated to Shopify (Sept 2026). Search results are server-rendered, but we still
// route through the scrape service for consistency/reliability with the other Shopify sellers.
//
// TODO: this hasn't actually been confirmed necessary for this site — manual requests with no
// browser fingerprint and no JS execution successfully returned full search results, and we haven't
// tested whether Cloudflare (or similar) bot detection kicks in under real production traffic.
// Worth investigating reverting to a plain AbstractDataGetter (direct axios GET, like the old
// pre-Shopify model below) if the scrape service proves unnecessary here.
class ScrapingDataGetter_TrollTrader extends AbstractScrapingDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/`,
            searchPath: 'search?type=product&q=',
            // Only show available (in-stock) results, matching the last word typed
            searchSuffix: '&options%5Bprefix%5D=last&filter.v.availability=1',
            searchJoin: '+',
            lazyElementSelector: '#filter-results',
        });
    }
}

// TODO: each result reflects only the single "from" price shown on the search card (the cheapest/
// default variant, labeled "Near Mint" in every case checked). We do not currently surface separate
// condition variants (NM/LP/MP/HP) or foil-vs-non-foil variants of the same printing — confirmed via
// a live comparison that foil listings are missing entirely for cards that also have a non-foil
// printing. That data only exists behind the product's variant picker ("Choose options"), which isn't
// present in the search-results HTML.
//
// Investigated whether this could be split via an AggregatingPriceGetter the way Axion does (two
// searches, one filtered to Foil, one to Non-Foil — see PriceGetter_Axion.ts). Confirmed each
// product *does* carry the same underlying data: fetching a product's Shopify JSON directly
// (/products/<handle>.js) shows a real "Card Finish" variant option with Foil/Non-Foil values and
// distinct per-finish prices. But unlike Axion's shop, Trolltrader hasn't exposed this as a search
// facet — the filter UI only offers availability/price/colour/keywords/rarity/set, and passing
// filter.v.option.card-finish=Foil (and slug variants: card_finish, cardfinish) had no effect at
// all: same result count and same displayed price as an unfiltered search, identical to passing a
// deliberately made-up filter param as a control. Shopify silently ignores unconfigured filters
// rather than erroring, so the aggregating-search approach isn't viable here. Getting foil prices
// would require a per-product .js fetch for every match, not just two differently-filtered list
// searches — a bigger change, revisit if per-variant granularity becomes a priority.
class DataProcessor_TrollTrader extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            // Each product card is a pagination-result <li> containing a <product-card> element
            resultSelector: 'li.js-pagination-result',
            titleSelector: 'p.card__title a.card-link',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            // Title is "Tarmogoyf (349)" or "Forest (314) - Surge-Foil" — strip everything from
            // the first parenthesis onward (collector number, boxtopper/foil-treatment suffix).
            // Split cards appear as "Tarmogoyf // Goblin (22/13)" — the "//" half is stripped
            // separately downstream by sanitizeString() when matching against the search term.
            titleFromText: (text): string => text.replace(/\s*\(.*$/, '').trim(),

            // Expansion isn't shown on the search card, but the product URL slug embeds the set
            // code, e.g. /products/mtg-singles-pip-tarmogoyf-349 -> "PIP"
            expansionSelector: '',

            priceSelector: 'span.price__current span.js-value',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),

            // Only in-stock results are shown (search is filtered with filter.v.availability=1)
            stockSelector: '', // not used
            stockValueFromStockText: (_: string): number => 1, // not used

            // Foil / special-foil treatments (Surge-Foil, Galaxy Foil, etc.) show up as a suffix
            // on the raw (uncleaned) title text after the collector number, e.g. "Forest (314) -
            // Surge-Foil" — read via isFoilSelector below, since titleFromText strips that suffix
            // from the cleaned title used for display.
            isFoilSelector: 'p.card__title a.card-link',

            imgSelector: 'div.card__media img',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'src',

            productSelector: 'p.card__title a.card-link',
            productBaseUrl: baseUrl,
            productRefAttribute: 'href',
        });
    }

    // @Override — only in-stock results are shown (search is filtered with filter.v.availability=1)
    stockFromResultNode = (_: Element): Stock => ({ inStock: true, level: '' + 1 });

    // @Override — set code isn't shown as text anywhere on the card; it's embedded in the
    // product URL slug (/products/mtg-singles-<set>-<name>-<collector>)
    expansionFromResultNode = (resultNode: Element): string => {
        const href = this.getFirstelementAttr(resultNode, this.productSelector, this.productRefAttribute);
        const match = href.match(/\/products\/mtg-singles-([a-z0-9]+)-/i);
        return match ? match[1].toUpperCase() : '';
    }
}

export default PriceGetter_TrollTrader;


// Old CrystalCommerce-platform model (pre-Sept 2026), kept for reference — replaced above when
// Troll Trader migrated to Shopify.
//
// class DataGetter_TrollTrader extends AbstractDataGetter {
//     constructor() {
//         super({
//             name: sellerName,
//             baseUrl: 'https://www.trolltradercards.com/',
//             searchPath: 'products/search?q=',
//             searchSuffix: '',
//             searchJoin: '+',
//         });
//     }
// }
//
// class DataProcessor_TrollTrader extends AbstractHtmlDataProcessor {
//     constructor() {
//         super({
//             seller: sellerName,
//             currency: currencies.GBP,
//
//             resultSelector: 'div.products-container > ul > li.product',
//             titleSelector: 'div.inner > div > div.meta > a > h4',
//
//             useSubResults: false,
//             subresultSelector: '',
//             subtitleSelector: '',
//             subtitleFromText: () => '',
//
//             priceSelector: 'div.inner > div > div.meta > span.offers > span.price',
//             priceValueFromPriceText: (text: string): number => parseInt(text.replace(/\D/g,'')),
//             stockSelector: 'div.inner > div > div.meta > span.offers > span.qty',
//             stockValueFromStockText: (text: string): number => text === undefined ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
//             isFoilSelector: 'div.inner > div > div.meta > a > h4',
//             expansionSelector: 'div.inner > div > div.meta > span.category',
//
//             imgSelector: 'div.inner > div > div.image > a > img',
//             imgBaseUrl: '',
//             imgSrcAttribute: 'src',
//
//             productSelector: 'div.inner > div > div.image > a',
//             productBaseUrl: 'https://www.trolltradercards.com',
//             productRefAttribute: 'href',
//         });
//     }
// }
