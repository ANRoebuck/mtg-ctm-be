import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';

const sellerName = 'Hareruya';
const baseUrl = 'https://www.hareruyamtg.com';

class PriceGetter_Hareruya extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'Rest of World',
            logoUrl: '',
            dataGetter: new DataGetter_Hareruya(),
            dataProcessor: new DataProcessor_Hareruya(),
        });
    }
}

class DataGetter_Hareruya extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/en/products/search/`,
            searchPath: 'unisearch_api?rows=50&kw=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_Hareruya extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.JPY,

            processData: (rawData: any): Price[] => {
                const docs: any[] = rawData?.response?.docs || [];

                return docs
                    .filter((p: any) => parseInt(p.stock) > 0)
                    .map((p: any): Price => {
                        const title: string = p.card_name;
                        const imgSrc: string = p.image_url;
                        const productRef: string = `${baseUrl}/en/products/detail/${p.product}`;
                        const expansion: string = (p.product_name_en?.match(/\[([A-Z0-9]+)\]/) || [])[1] || '';
                        const price_minorUnits: number = parseInt(p.price);
                        const price_majorUnits: number = currencyService.minorUnitsToMajorUnits(price_minorUnits, currencies.JPY);
                        const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.JPY);
                        const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.JPY);
                        const isFoil: boolean = p.foil_flg === '1';

                        return {
                            seller: sellerName,
                            title,
                            imgSrc,
                            productRef,
                            expansion,
                            price_relativeUnits,
                            price_textRepresentation,
                            stock_inStock: true,
                            stock_level: p.stock,
                            subtitle: '',
                            isFoil,
                        };
                    });
            }
        });
    }
}

export default PriceGetter_Hareruya;
