import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = 'Boards & Swords';
const baseUrl = 'https://www.boardsandswords.co.uk';

class PriceGetter_BoardsAndSwords extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '',
            dataGetter: new DataGetter_BoardsAndSwords(),
            dataProcessor: new DataProcessor_BoardsAndSwords(),
        });
    }
}

class DataGetter_BoardsAndSwords extends AbstractDataGetter {
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

class DataProcessor_BoardsAndSwords extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            processData: (rawData: any): Price[] => {
                const products: any[] = rawData?.resources?.results?.products || [];

                return products
                    .filter((p: any) => p.type === 'Singles' && p.available)
                    .map((p: any): Price => {
                        const title: string = p.title;
                        const imgSrc: string = p.image;
                        const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();
                        const tags: string[] = p.tags || [];
                        const expansion: string = tags.find((t: string) => /^[A-Z0-9]{2,6}$/.test(t)) || '';
                        const price_majorUnits: number = parseFloat(p.price);
                        const price_minorUnits: number = Math.round(price_majorUnits * 100);
                        const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.GBP);
                        const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.GBP);
                        const isFoil: boolean = title.toLowerCase().includes('foil') || tags.includes('Foil');

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

export default PriceGetter_BoardsAndSwords;
