import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies, Currency } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';

const sellerName = 'Big Orbit Cards';

class PriceGetter_BigOrbitCards extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_BigOrbitCards(),
            dataProcessor: new DataProcesor_BigOrbitCards(),
        });
    }
}

class DataGetter_BigOrbitCards extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.bigorbitcards.co.uk/',
            searchPath: 'shop-all-games/search/',
            searchSuffix: '/',
            searchJoin: '+',
        });
    }
}

class DataProcesor_BigOrbitCards extends AbstractJsonDataProcessor {

    seller: string;
    currency: Currency;

    constructor() {
        super();
        this.seller = sellerName;
        this.currency = currencies.GBP;
    }

    // @Override
    processData = (rawData: any): Price[] => {
        const results: object[] = rawData.result || [];
    
        return results.map((result: any): Price => {
            const title: string = result.name.split('|')[0].replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, '$2');
            const imgSrc: string = result.image;
            const productRef: string = result.url;
            const expansion: string = result.magic_set;
            const price_minorUnits: number = parseInt(result.price.replace(/\D/g,''));
            const price_majorUnits = currencyService.minorUnitsToMajorUnits(price_minorUnits, this.currency);
            const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, this.currency);
            const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, this.currency);
            const stock_level = parseInt(result.inventory_level);
            const stock_inStock = stock_level > 0;
            const isFoil: boolean = title.toLowerCase().includes('foil');
            return {
                seller: this.seller,
                title,
                imgSrc,
                productRef,
                expansion,
                price_relativeUnits,
                price_textRepresentation,
                stock_inStock,
                stock_level: '' + stock_level,
                subtitle: '',
                isFoil };
        });
    }

}

const textStringFromInnerHtml: RegExp = /(.|\n)*£([0-9]+).([0-9]{2})[\D]*/;

export default PriceGetter_BigOrbitCards;
