import AbstractScrapingDataGetter from './AbstractScrapingDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Total Cards';
const baseUrl = 'https://totalcards.net';

class PriceGetter_TotalCards extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Total_Cards_logo_500x200.png',
            dataGetter: new ScrapingDataGetter_TotalCards(),
            dataProcessor: new DataProcessor_TotalCards(),
        });
    }
}

// class DataGetter_TotalCards extends AbstractDataGetter {
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

class ScrapingDataGetter_TotalCards extends AbstractScrapingDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/`,
            searchPath: 'search?type=product&options%5Bprefix%5D=last&q=',
            searchSuffix: '',
            searchJoin: '+',
            lazyElementSelector: null,
        });
    }
}

// class DataProcessor_TotalCards extends AbstractJsonDataProcessor {
//     constructor() {
//         super({
//             seller: sellerName,
//             currency: currencies.GBP,
//             processData: (rawData: any): Price[] => {
//                 const products: any[] = rawData?.resources?.results?.products || [];
//                 return products
//                     .filter((p: any) => p.type === 'Single Card' && p.available)
//                     .map((p: any): Price => {
//                         // Title format: "Magic The Gathering - {Set} - {Card Name} - {Number}"
//                         const parts: string[] = p.title.split(' - ');
//                         const isFoil: boolean = p.title.toLowerCase().includes('foil');
//                         const title: string = parts[parts.length - 2];
//                         const expansion: string = parts.slice(1, parts.length - 2).join(' - ');
//                         const imgSrc: string = p.image;
//                         const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();
//                         const price_majorUnits: number = parseFloat(p.price);
//                         const price_minorUnits: number = Math.round(price_majorUnits * 100);
//                         const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.GBP);
//                         const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.GBP);
//                         return {
//                             seller: sellerName, title, imgSrc, productRef, expansion,
//                             price_relativeUnits, price_textRepresentation,
//                             stock_inStock: true, stock_level: '1', subtitle: '', isFoil,
//                         };
//                     });
//             }
//         });
//     }
// }

class DataProcessor_TotalCards extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            // Each product card is a div.col.product-box
            resultSelector: 'div.col.product-box',

            // Title element contains the full Shopify title:
            // "Magic The Gathering - {Set} - {Card Name} - {Number}"
            titleSelector: 'a.product-title',
            titleFromText: (text): string => {
                const parts = text.split(' - ');
                return parts[parts.length - 2] ?? text;
            },

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            // Expansion is the middle segment(s) of the same title string
            expansionSelector: 'a.product-title',
            expansionFromText: (text): string => {
                const parts = text.split(' - ');
                return parts.slice(1, parts.length - 2).join(' - ');
            },

            priceSelector: 'span.price',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),

            // Sold-out badge is present when out of stock, absent when in stock
            stockSelector: 'span.badge.sold-out',
            stockValueFromStockText: (text): number => text ? 0 : 1,

            // "(Foil)" appears in the title for foil variants
            isFoilSelector: 'a.product-title',

            imgSelector: 'img',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'src',

            productSelector: '.image-inner a',
            productBaseUrl: baseUrl,
            productRefAttribute: 'href',
        });
    }
}

export default PriceGetter_TotalCards;
