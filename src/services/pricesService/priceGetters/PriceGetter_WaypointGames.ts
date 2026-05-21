import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = 'Waypoint Games';
const baseUrl = 'https://www.waypointgames.ca';

class PriceGetter_WaypointGames extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'North America',
            logoUrl: '/images/Waypoint_Games_logo_300x120.png',
            dataGetter: new DataGetter_WaypointGames(),
            dataProcessor: new DataProcessor_WaypointGames(),
        });
    }
}

class DataGetter_WaypointGames extends AbstractDataGetter {
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

class DataProcessor_WaypointGames extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.CAD,

            processData: (rawData: any): Price[] => {
                const products: any[] = rawData?.resources?.results?.products || [];

                return products
                    .filter((p: any) => p.type === 'MTG Single' && p.available)
                    .map((p: any): Price => {
                        const title: string = p.title;
                        const imgSrc: string = p.image;
                        const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();
                        const price_majorUnits: number = parseFloat(p.price);
                        const price_minorUnits: number = Math.round(price_majorUnits * 100);
                        const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.CAD);
                        const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.CAD);
                        const tags: string[] = p.tags || [];
                        // Products with foil variants have the "Foil" tag.
                        // Non-foil variants carry the "Normal" tag.
                        // A product with "Foil" but no "Normal" is foil-only.
                        const isFoil: boolean = tags.includes('Foil') && !tags.includes('Normal');

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

export default PriceGetter_WaypointGames;
