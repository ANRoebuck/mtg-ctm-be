import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import AggregatingPriceGetter from './AggregatingPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Axion Now';

class PriceGetter_Axion extends AggregatingPriceGetter {
    constructor() {
        super({
            name: sellerName,
            priceGetters: [
                new PriceGetter_Axion_NonFoil(),
                new PriceGetter_Axion_Foil(),
            ],
        });
    }
}

class PriceGetter_Axion_NonFoil extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_Axion_NonFoil(),
            dataProcessor: new DataProcessor_Axion_NonFoil(),
        });
    }
}

class PriceGetter_Axion_Foil extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_Axion_Foil(),
            dataProcessor: new DataProcessor_Axion_Foil(),
        });
    }
}

class DataGetter_Axion_NonFoil extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'https://www.axionnow.com/',
            searchPath: 'search?type=product&q=',
            searchSuffix: '&filter.v.availability=1&filter.v.option.finish=Non-Foil',
            searchJoin: '+'
        });
    }
}

class DataGetter_Axion_Foil extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'https://www.axionnow.com/',
            searchPath: 'search?type=product&q=',
            searchSuffix: '&filter.v.availability=1&filter.v.option.finish=Foil',
            searchJoin: '+'
        });
    }
}

const args = {
    seller: sellerName,
    currency: currencies.GBP,

    // resultSelector: 'div[class="#collection-grid"] > div[class="#grid"] > div[class="#product-card"]',
    resultSelector: 'div[class="#collection-grid"] > div > div',
    titleSelector: 'a',

    useSubResults: false,
    subresultSelector: '',
    subtitleSelector: '',
    subtitleFromText: () => '',

    priceSelector: 'div[class="#product-card-caption @offset-top"] > div[class="#product-card-price"] > dl[class="#price"] > div > dd > span[class="#price-value"]',
    priceValueFromPriceText: (text: string): number => parseInt(text.replace(/\D/g, '')),
    stockSelector: 'a', // there is no stock selector, but map requires an element
    stockValueFromStockText: (_: string): number => 1,
    isFoilSelector: 'div.inner > div > div.meta > a > h4',
    expansionSelector: 'div.inner > div > div.meta > a > span.category',

    imgSelector: 'div[class="#product-card-media"] > div > div[class="#media-image-wrapper"] > img',
    imgBaseUrl: 'https:',
    imgSrcAttribute: 'src',

    productSelector: 'a',
    productBaseUrl: 'https://www.axionnow.com/',
    productRefAttribute: 'href',
};

class DataProcessor_Axion_NonFoil extends AbstractHtmlDataProcessor {
    constructor() {
        super(args);
    }

    // @Override
    titleFromResultNode = (resultNode: Element): string => {
        return this.getFirstElementHtml(resultNode, this.titleSelector)
            .replace(/(.*)\((.*)\)/g, `$1`)                  // remove segment in brackets
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);   // remove leading+trailing whitespace
    }
}

class DataProcessor_Axion_Foil extends AbstractHtmlDataProcessor {
    constructor() {
        super(args);
    }

    // @Override
    titleFromResultNode = (resultNode: Element): string => {
        return this.getFirstElementHtml(resultNode, this.titleSelector)
            .replace(/(.*)\((.*)\)/g, `$1`)                  // remove segment in brackets
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);   // remove leading+trailing whitespace
    }

    // @Override
    isFoilFromString = (_: string): boolean => true;
}

export default PriceGetter_Axion;
