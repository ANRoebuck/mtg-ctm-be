import AbstractScrapingDataGetter from './AbstractScrapingDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Lvl Up Gaming';
const baseUrl = 'https://lvlupgaming.co.uk';

class PriceGetter_LvlUp extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Lvl_Up_Gaming_logo_150x60.png',
            dataGetter: new ScrapingDataGetter_LvlUp(),
            dataProcessor: new DataProcessor_LvlUp(),
        });
    }
}

// class DataGetter_LvlUp extends AbstractDataGetter {
//     constructor() {
//         super({
//             name: sellerName,
//             baseUrl: `${baseUrl}/`,
//             searchPath: 'search/suggest.json?q=',
//             searchSuffix: '&resources[type]=product&resources[limit]=20',
//             searchJoin: '+',
//         });
//     }
// }

class ScrapingDataGetter_LvlUp extends AbstractScrapingDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/`,
            searchPath: 'search?type=product&options%5Bprefix%5D=last&q=',
            searchSuffix: '',
            searchJoin: '+',
            lazyElementSelector: '.product-grid-container',
        });
    }
}

// class DataProcessor_LvlUp extends AbstractJsonDataProcessor {
//     constructor() {
//         super({
//             seller: sellerName,
//             currency: currencies.GBP,
//             processData: (rawData: any): Price[] => {
//                 const products: any[] = rawData?.resources?.results?.products || [];
//                 return products
//                     .filter((p: any) => p.type === 'Singles' && p.available)
//                     .map((p: any): Price => {
//                         const title: string = p.title;
//                         const imgSrc: string = p.image;
//                         const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();
//                         const tags: string[] = p.tags || [];
//                         const expansion: string = tags.find((t: string) => /^[A-Z0-9]{2,6}$/.test(t)) || '';
//                         const price_majorUnits: number = parseFloat(p.price);
//                         const price_minorUnits: number = Math.round(price_majorUnits * 100);
//                         const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.GBP);
//                         const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.GBP);
//                         const isFoil: boolean = title.toLowerCase().includes('foil') || tags.includes('Foil');
//                         return {
//                             seller: sellerName,
//                             title,
//                             imgSrc,
//                             productRef,
//                             expansion,
//                             price_relativeUnits,
//                             price_textRepresentation,
//                             stock_inStock: true,
//                             stock_level: '1',
//                             subtitle: '',
//                             isFoil,
//                         };
//                     });
//             }
//         });
//     }
// }

// class DataProcessor_LvlUp extends AbstractHtmlDataProcessor — old theme (pre-Jun 2026)
// Old theme used BinderPOS product-card-list2 layout with per-card variant dropdowns.
// Selectors: resultSelector: 'div.product-card-list2', titleSelector: 'div.h4.grid-view-item__title',
//   expansionFromResultNode extracted "[Set]" from title, stockSelector: '.grid-view-item--sold-out'.

class DataProcessor_LvlUp extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            // Dawn theme — each product is a card-wrapper div
            resultSelector: 'div.card-wrapper.product-card-wrapper',

            // Title is "Steam Vents (267)" — strip trailing collector number (and any suffix after it)
            titleSelector: 'h3.card__heading.h5 a',
            titleFromText: (text): string => text.replace(/\s*\(\d+[a-z]?\).*$/i, '').trim(),

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            // Expansion is not shown on search result cards in this theme
            expansionSelector: '',

            // Price displayed as "From £11.89 GBP" — strip non-digits to get pence integer
            priceSelector: '.price-item.price-item--regular',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),

            // "Sold out" badge is present when OOS, absent when in stock
            stockSelector: '.card__badge .badge',
            stockValueFromStockText: (text): number => text ? 0 : 1,

            // Foil and non-foil are variants within the same card — not distinguishable per card in this theme
            isFoilSelector: '',

            imgSelector: '.card__media img',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'src',

            productSelector: 'h3.card__heading.h5 a',
            productBaseUrl: baseUrl,
            productRefAttribute: 'href',
        });
    }
}

export default PriceGetter_LvlUp;
