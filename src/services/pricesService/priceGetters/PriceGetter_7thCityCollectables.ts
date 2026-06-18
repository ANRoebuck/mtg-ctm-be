import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = '7th City Collectables';
const baseUrl = 'https://7thcitycollectables.com';

// 7th City Collectables is a UK Shopify store using the Card Companion platform (same as moxinthehole.co.uk).
// Each product has multiple condition/foil variants (e.g. "Non-Foil / Near Mint", "Foil / Near Mint", "Non-Foil / Good").
// suggest.json only exposes a product-level price range — not per-variant prices or availability.
// KNOWN LIMITATION: we use `price` (the floor across all variants) as a proxy for the lowest available price,
// and assume it represents a non-foil item. Foil results are intentionally ignored as they cannot be reliably
// identified from this API. Accurate pricing would require fetching individual product pages (N+1 requests).
// Expansion is embedded in the body HTML field.

class PriceGetter_7thCityCollectables extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/7th_City_Collectables_logo_200x80.png',
            dataGetter: new DataGetter_7thCityCollectables(),
            dataProcessor: new DataProcessor_7thCityCollectables(),
        });
    }
}

class DataGetter_7thCityCollectables extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/`,
            searchPath: 'search/suggest.json?q=',
            searchSuffix: '&resources[type]=product&resources[limit]=20',
            searchJoin: '+',
        });
    }
}

const expansionFromBody = (body: string): string => {
    const m = body?.match(/product-description-set-name[^>]*>.*?<a[^>]*>([^<]+)<\/a>/s);
    return m ? m[1].trim() : '';
};

class DataProcessor_7thCityCollectables extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            processData: (rawData: any): Price[] => {
                const products: any[] = rawData?.resources?.results?.products || [];
                const prices: Price[] = [];

                for (const p of products) {
                    if (p.type !== 'Singles' || !p.available) continue;

                    const title: string = p.title;
                    const expansion: string = expansionFromBody(p.body || '');
                    const imgSrc: string = p.featured_image?.url || p.image || '';
                    const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();

                    const priceMajor: number = parseFloat(p.price);
                    const priceMinor: number = Math.round(priceMajor * 100);

                    prices.push({
                        seller: sellerName,
                        title,
                        expansion,
                        isFoil: false,
                        price_relativeUnits: currencyService.minorUnitsToRelativeUnits(priceMinor, currencies.GBP),
                        price_textRepresentation: currencyService.majorUnitsToTextRepresentation(priceMajor, currencies.GBP),
                        stock_inStock: true,
                        stock_level: 'NM',
                        subtitle: '',
                        productRef,
                        imgSrc,
                    });
                }

                return prices;
            }
        });
    }
}

export default PriceGetter_7thCityCollectables;
