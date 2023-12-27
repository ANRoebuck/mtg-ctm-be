import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import currencyService from '../../currencyService/CurrencyService';

const sellerName = 'Magic Madhouse';

class PriceGetter_MagicMadhouse extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_MagicMadhouse(),
            dataProcessor: new DataProcessor_MagicMadhouse(),
        });
    }
}

class DataGetter_MagicMadhouse extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://eucs25.ksearchnet.com/',
            searchPath: 'cloud-search/n-search/search?ticket=klevu-161710301480613427&term=',
            searchSuffix: '&paginationStartsFrom=0&sortPrice=false&ipAddress=undefined&analyticsApiKey=klevu-161710301480613427&showOutOfStockProducts=true&klevuFetchPopularTerms=false&klevu_priceInterval=500&fetchMinMaxPrice=true&klevu_multiSelectFilters=true&noOfResults=36&klevuSort=rel&enableFilters=true&filterResults=&visibility=search&category=KLEVU_PRODUCT&klevu_filterLimit=400&sv=121&lsqt=&responseType=json&priceFieldSuffix=GBP&klevu_loginCustomerGroup=',
            searchJoin: '%20',
        });
    }
}

class DataProcessor_MagicMadhouse extends AbstractJsonDataProcessor {

    seller: string;
    currencyCode: string;

    constructor() {
        super();
        this.seller = sellerName;
        this.currencyCode = 'GBP';
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
            const price_majorUnits = currencyService.minorUnitsToMajorUnits(price_minorUnits, this.currencyCode);
            const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, this.currencyCode);
            const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, this.currencyCode);
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

export default PriceGetter_MagicMadhouse;
