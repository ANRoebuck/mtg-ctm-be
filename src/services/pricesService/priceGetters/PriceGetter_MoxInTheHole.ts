import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = 'Mox In The Hole';
const baseUrl = 'https://moxinthehole.co.uk';

// Mox In The Hole is a Shopify store. Each product represents a single card printing
// with exactly two NM variants: "Non-Foil / Near Mint" and "Foil / Near Mint".
// suggest.json accurately reflects per-product availability.
// price = non-foil NM price, price_max = foil NM price (equal when only one variant exists).
// Expansion is embedded in the body HTML field.

class PriceGetter_MoxInTheHole extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Mox_in_the_Hole_logo_300x120.png',
            dataGetter: new DataGetter_MoxInTheHole(),
            dataProcessor: new DataProcessor_MoxInTheHole(),
        });
    }
}

class DataGetter_MoxInTheHole extends AbstractDataGetter {
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

class DataProcessor_MoxInTheHole extends AbstractJsonDataProcessor {
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

                    const nonFoilMajor: number = parseFloat(p.price);
                    const nonFoilMinor: number = Math.round(nonFoilMajor * 100);

                    prices.push({
                        seller: sellerName,
                        title,
                        expansion,
                        isFoil: false,
                        price_relativeUnits: currencyService.minorUnitsToRelativeUnits(nonFoilMinor, currencies.GBP),
                        price_textRepresentation: currencyService.majorUnitsToTextRepresentation(nonFoilMajor, currencies.GBP),
                        stock_inStock: true,
                        stock_level: 'NM',
                        subtitle: '',
                        productRef,
                        imgSrc,
                    });

                    // Add foil result when a foil variant exists (price_max > price)
                    const foilMajor: number = parseFloat(p.price_max);
                    if (foilMajor > nonFoilMajor) {
                        const foilMinor: number = Math.round(foilMajor * 100);
                        prices.push({
                            seller: sellerName,
                            title,
                            expansion,
                            isFoil: true,
                            price_relativeUnits: currencyService.minorUnitsToRelativeUnits(foilMinor, currencies.GBP),
                            price_textRepresentation: currencyService.majorUnitsToTextRepresentation(foilMajor, currencies.GBP),
                            stock_inStock: true,
                            stock_level: 'NM',
                            subtitle: '',
                            productRef,
                            imgSrc,
                        });
                    }
                }

                return prices;
            }
        });
    }
}

export default PriceGetter_MoxInTheHole;
