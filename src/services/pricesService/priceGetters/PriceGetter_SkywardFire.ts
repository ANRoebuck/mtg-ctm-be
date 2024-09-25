import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

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
            name: sellerName,
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
            currency: currencies.GBP,

            resultSelector: 'div > section > div > div > ul > li.product',
            titleSelector: 'div.inner > div > div.meta > a > h4',

            useSubResults: true,
            subresultSelector: 'div.inner > div.variants > div.variant-row',
            subtitleSelector: 'span.variant-main-info > span.variant-short-info',
            subtitleFromText: (x) => x.replace(/<.*>.*<\/.*>/, '').replace(/(.*),/, `$1`), // remove inner tags, then remove trailing comma

            priceSelector: 'span.variant-buttons > form > div.product-price-qty > span',
            priceValueFromPriceText: (text: string): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'span.variant-main-info > span.variant-short-info > em',
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
