import AbstractScrapingDataGetter from './AbstractScrapingDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Gearhead Games';
const baseUrl = 'https://www.gearheadgames.co.uk';

class PriceGetter_GearheadGames extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Gearhead_Games_logo_300x120.png',
            dataGetter: new ScrapingDataGetter_GearheadGames(),
            dataProcessor: new DataProcessor_GearheadGames(),
        });
    }
}

// class DataGetter_GearheadGames extends AbstractDataGetter {
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

class ScrapingDataGetter_GearheadGames extends AbstractScrapingDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/`,
            searchPath: 'search?type=product&q=',
            searchSuffix: '',
            searchJoin: '+',
            lazyElementSelector: '.product-grid__item',
        });
    }
}

// class DataProcessor_GearheadGames extends AbstractJsonDataProcessor {
//     constructor() {
//         super({
//             seller: sellerName,
//             currency: currencies.GBP,
//             processData: (rawData: any): Price[] => {
//                 const products: any[] = rawData?.resources?.results?.products || [];
//                 return products
//                     .filter((p: any) => p.vendor === 'Magic: The Gathering' && p.available)
//                     .map((p: any): Price => {
//                         const title: string = p.title;
//                         const imgSrc: string = p.image;
//                         const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();
//                         const price_minorUnits: number = parseInt(p.price.replace(/\D/g, ''));
//                         const price_majorUnits = currencyService.minorUnitsToMajorUnits(price_minorUnits, currencies.GBP);
//                         const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.GBP);
//                         const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.GBP);
//                         const isFoil: boolean = /(?<!non[-\s]?)foil/i.test(title);
//                         return {
//                             seller: sellerName, title, imgSrc, productRef, expansion: '',
//                             price_relativeUnits, price_textRepresentation,
//                             stock_inStock: true, stock_level: '1', subtitle: '', isFoil,
//                         };
//                     });
//             }
//         });
//     }
// }

class DataProcessor_GearheadGames extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: '.product-grid__item',

            // Title format: "Watery Grave (259)" — strip trailing collector number in parens
            titleSelector: 'h3.h4',
            titleFromText: (text): string => text.replace(/\s*\(.*\)\s*$/, '').trim(),

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            // Expansion is not displayed on search result cards
            expansionSelector: '',

            priceSelector: '.price',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),

            // Out-of-stock badge is present when OOS, absent when in stock
            stockSelector: '.product-badges__badge--rectangle',
            stockValueFromStockText: (text): number => text ? 0 : 1,

            // Foil not shown as a badge on search results — detected from title text if present
            isFoilSelector: 'h3.h4',

            imgSelector: '.product-media__image',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'src',

            productSelector: '.product-card__link',
            productBaseUrl: baseUrl,
            productRefAttribute: 'href',
        });
    }

    // Expansion is not visible on search result cards — extract set code from the product href.
    // Href format: /products/mtg-singles-{setcode}-{cardname}-{number}
    // e.g. /products/mtg-singles-grn-waterygrave-259 → "Grn"
    expansionFromResultNode = (resultNode: Element): string => {
        const href = resultNode.querySelector('.product-card__link')?.getAttribute('href') ?? '';
        const match = href.match(/mtg-singles-([a-z]+)-/);
        if (!match) return '';
        const code = match[1];
        return code.charAt(0).toUpperCase() + code.slice(1);
    };
}

export default PriceGetter_GearheadGames;
