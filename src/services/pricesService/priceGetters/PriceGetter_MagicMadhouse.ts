import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractJsonDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';
import {Price, StockStatus} from "../../../types/Price";


class PriceGetter_MagicMadhouse extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Magic Madhouse',
            dataGetter: new DataGetter_MagicMadhouse(),
            processorSelector: new ProcessorSelector_MagicMadhouse(),
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

class ProcessorSelector_MagicMadhouse extends AbstractProcessorSelector {
    constructor() {
        super([new DataProcessor_MagicMadhouse()]);
    }
}

class DataProcessor_MagicMadhouse extends AbstractJsonDataProcessor {

    seller: string;

    constructor() {
        super();
        this.seller = 'Magic Madhouse';
    }

    // @Override
    processData = (rawData: any): Price[] => {
        const results: object[] = rawData.result || [];

        return results.map((result: any): Price => {
            const title: string = result.name.split('|')[0].replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, '$2');
            const imgSrc: string = result.image;
            const productRef: string = result.url;
            const expansion: string = result.magic_set;
            const price: number = parseInt(result.price.replace(/\D/g,''));
            const inventoryLevel = parseInt(result.inventory_level);
            const stock: StockStatus = inventoryLevel > 0 ? { inStock: true, stock: inventoryLevel } : { inStock: false, stock: 0 };
            const isFoil: boolean = title.toLowerCase().includes('foil');
            return { seller: this.seller, title, imgSrc, productRef, expansion, price, stock, subtitle: '', isFoil };
        });
    }

}

export default PriceGetter_MagicMadhouse;
