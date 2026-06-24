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

class DataProcessor_LvlUp extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'div.product-card-list2',

            // titleFromResultNode overridden below — combines card name + selected variant
            titleSelector: 'div.h4.grid-view-item__title',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            // Expansion is in brackets in the title text: "Steam Vents [Guildpact]" → "Guildpact"
            expansionSelector: 'div.h4.grid-view-item__title',
            expansionFromText: (text): string => text.match(/\[(.*?)\]/)?.[1]?.trim() ?? '',

            priceSelector: '.product-price__price.is-bold',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),

            // .grid-view-item--sold-out is on the inner div only for sold-out cards.
            // span.value.outstock is always present with "SOLD OUT" text (CSS-toggled by JS) — not usable.
            stockSelector: '.grid-view-item--sold-out',
            stockValueFromStockText: (text): number => text ? 0 : 1,

            // Selected variant option contains "Foil" for foil cards: "Near Mint Foil"
            isFoilSelector: 'option[selected]',

            imgSelector: '.grid-view-item__image',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'src',

            productSelector: 'a[href*="/products/"]',
            productBaseUrl: baseUrl,
            productRefAttribute: 'href',
        });
    }

    // @Override — title = card name (strip [set]) + selected variant: "Steam Vents - Near Mint Foil"
    titleFromResultNode = (resultNode: Element): string => {
        const rawTitle = this.getFirstElementHtml(resultNode, this.titleSelector);
        const cardName = rawTitle.replace(/\s*\[.*?\].*$/, '').trim();
        const variant = resultNode.querySelector('option[selected]')?.textContent?.trim() ?? '';
        return variant ? `${cardName} - ${variant}` : cardName;
    };
}

export default PriceGetter_LvlUp;
