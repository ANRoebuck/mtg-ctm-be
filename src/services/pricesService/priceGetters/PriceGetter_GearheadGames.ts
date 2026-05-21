import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = 'Gearhead Games';
const baseUrl = 'https://www.gearheadgames.co.uk';

class PriceGetter_GearheadGames extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Gearhead_Games_logo_2_300x120.png',
            dataGetter: new DataGetter_GearheadGames(),
            dataProcessor: new DataProcessor_GearheadGames(),
        });
    }
}

class DataGetter_GearheadGames extends AbstractDataGetter {
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

class DataProcessor_GearheadGames extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            processData: (rawData: any): Price[] => {
                const products: any[] = rawData?.resources?.results?.products || [];

                return products
                    .filter((p: any) => p.vendor === 'Magic: The Gathering' && p.available)
                    .map((p: any): Price => {
                        const title: string = p.title;
                        const imgSrc: string = p.image;
                        const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();
                        const price_minorUnits: number = parseInt(p.price.replace(/\D/g, ''));
                        const price_majorUnits = currencyService.minorUnitsToMajorUnits(price_minorUnits, currencies.GBP);
                        const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.GBP);
                        const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.GBP);
                        const isFoil: boolean = /(?<!non[-\s]?)foil/i.test(title);

                        return {
                            seller: sellerName,
                            title,
                            imgSrc,
                            productRef,
                            expansion: '',
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

export default PriceGetter_GearheadGames;
