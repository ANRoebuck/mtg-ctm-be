import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';

const sellerName = 'Skyward Fire';

class PriceGetter_SkywardFire extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_SkywardFire(),
            dataProcessor: new DataProcessor_SkywardFire(),
        });
    }
}

class DataGetter_SkywardFire extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.skywardfire.com/',
            searchPath: 'products/search?q=',
            searchSuffix: '',
            searchJoin: '+'
        });
    }
}

class DataProcessor_SkywardFire extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currencyCode: 'GBP',

            resultSelector: 'div > section > div > div > ul > li.product',
            titleSelector: 'div.inner > div > div.meta > a > h4',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.inner > div > div > span > form > div.product-price-qty > span',
            priceValueFromPriceText: (text: string): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div.inner > div.variants > div > span > span > em',
            stockValueFromStockText: (text: string): number => text === 'Out of stock.' ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: 'div.inner > div > div.meta > a > h4',
            expansionSelector: 'div.inner > div > div.meta > a > span.category',

            imgSelector: 'div.inner > div > div.image > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div.inner > div > div.image > a',
            productBaseUrl: 'https://www.skywardfire.com',
            productRefAttribute: 'href',
        });
    }
}

export default PriceGetter_SkywardFire;
