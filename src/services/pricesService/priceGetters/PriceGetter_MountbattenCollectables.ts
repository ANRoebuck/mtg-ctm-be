import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Mountbatten Collectables';

class PriceGetter_MountbattenCollectables extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_MountbattenCollectables(),
            dataProcessor: new DataProcessor_MountbattenCollectables(),
        });
    }
}

class DataGetter_MountbattenCollectables extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.mountbattencollectables.com/',
            searchPath: 'products/search?q=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_MountbattenCollectables extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'ul.products > li.product',
            titleSelector: 'div.inner > div > div.meta > a > h4',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.inner > div > div.meta > div.list-variants.grid > div > span > form > div > span.regular',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div.inner > div > div.meta > div > div > span.variant-main-info > span.variant-qty',
            stockValueFromStockText: (text) => text === 'Out of stock.' ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: 'div.inner > div > div.meta > a > h4',
            expansionSelector: 'div.inner > div > div.meta > a > span.category',

            imgSelector: 'div.inner > div > div.image > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div.inner > div > div.image > a',
            productBaseUrl: 'https://www.mountbattencollectables.com/',
            productRefAttribute: 'href',
        });
    }
}

export default PriceGetter_MountbattenCollectables;
