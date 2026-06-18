import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = 'Mr Card Singles';
const baseUrl = 'https://mr-card-singles.co.uk';

class PriceGetter_MrCardSingles extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Mr_Card_Singles_logo_300x120.png',
            dataGetter: new DataGetter_MrCardSingles(),
            dataProcessor: new DataProcessor_MrCardSingles(),
        });
    }
}

class DataGetter_MrCardSingles extends AbstractDataGetter {
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

class DataProcessor_MrCardSingles extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            processData: (rawData: any): Price[] => {
                const products: any[] = rawData?.resources?.results?.products || [];

                return products
                    .filter((p: any) => p.vendor === 'Mr Card Singles' && p.available)
                    .map((p: any): Price => {
                        const title: string = p.title;
                        const imgSrc: string = p.image;
                        const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();
                        const expansion: string = p.type || '';
                        const price_majorUnits: number = parseFloat(p.price);
                        const price_minorUnits: number = Math.round(price_majorUnits * 100);
                        const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.GBP);
                        const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.GBP);
                        const tags: string[] = p.tags || [];
                        const isFoil: boolean = tags.includes('Foil') && !tags.includes('Non Foil');

                        return {
                            seller: sellerName,
                            title,
                            imgSrc,
                            productRef,
                            expansion,
                            price_relativeUnits,
                            price_textRepresentation,
                            stock_inStock: true,
                            stock_level: '1',
                            subtitle: '',
                            isFoil,
                        };
                    });
            }
        });
    }
}

export default PriceGetter_MrCardSingles;
