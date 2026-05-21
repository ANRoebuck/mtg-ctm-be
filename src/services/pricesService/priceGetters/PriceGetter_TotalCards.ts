import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = 'Total Cards';
const baseUrl = 'https://totalcards.net';

class PriceGetter_TotalCards extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Total_Cards_logo_500x200.png',
            dataGetter: new DataGetter_TotalCards(),
            dataProcessor: new DataProcessor_TotalCards(),
        });
    }
}

class DataGetter_TotalCards extends AbstractDataGetter {
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

class DataProcessor_TotalCards extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            processData: (rawData: any): Price[] => {
                const products: any[] = rawData?.resources?.results?.products || [];

                return products
                    .filter((p: any) => p.type === 'Single Card' && p.available)
                    .map((p: any): Price => {
                        // Title format: "Magic The Gathering - {Set} - {Card Name} - {Number}"
                        // Occasionally: "Magic The Gathering - {Set} - {Subset} - {Card Name} - {Number}"
                        const parts: string[] = p.title.split(' - ');
                        const isFoil: boolean = p.title.toLowerCase().includes('foil');
                        const title: string = parts[parts.length - 2];
                        const expansion: string = parts.slice(1, parts.length - 2).join(' - ');

                        const imgSrc: string = p.image;
                        const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();
                        const price_majorUnits: number = parseFloat(p.price);
                        const price_minorUnits: number = Math.round(price_majorUnits * 100);
                        const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.GBP);
                        const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.GBP);

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

export default PriceGetter_TotalCards;
