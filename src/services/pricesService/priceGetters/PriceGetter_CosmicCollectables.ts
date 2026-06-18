import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = 'Cosmic Collectables';
const baseUrl = 'https://www.cosmiccollectables.co.uk';

class PriceGetter_CosmicCollectables extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Cosmic_Collectables_logo_300x120.png',
            dataGetter: new DataGetter_CosmicCollectables(),
            dataProcessor: new DataProcessor_CosmicCollectables(),
        });
    }
}

class DataGetter_CosmicCollectables extends AbstractDataGetter {
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

class DataProcessor_CosmicCollectables extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            processData: (rawData: any): Price[] => {
                const products: any[] = rawData?.resources?.results?.products || [];

                return products
                    .filter((p: any) => p.type === 'Magic The Gathering' && p.available)
                    .map((p: any): Price => {
                        const title: string = p.title;
                        const imgSrc: string = p.image;
                        const productRef: string = baseUrl + new StringCleaner(p.url).trimWhitespace().removeQueryParams().get();
                        const price_minorUnits: number = parseInt(p.price.replace(/\D/g, ''));
                        const price_majorUnits = currencyService.minorUnitsToMajorUnits(price_minorUnits, currencies.GBP);
                        const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.GBP);
                        const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.GBP);
                        const isFoil: boolean = (p.tags as string[]).includes('Variant_Foil');

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

export default PriceGetter_CosmicCollectables;
