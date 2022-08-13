import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';


class PriceGetter_ManaLeak extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Mana Leak',
            dataGetter: new DataGetter_ManaLeak(),
            dataProcessor: new DataProcessor_ManaLeak(),
        });
    }
}

class DataGetter_ManaLeak extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.manaleak.com/',
            searchPath: '/index.php?route=product/search&search=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_ManaLeak extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Mana Leak',
            currencyCode: 'GBP',

            resultSelector: 'div.main-products > div.product-list-item',
            titleSelector: 'div.caption > div.name > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.caption > div.price',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div.image > span.label-outofstock',
            stockValueFromStockText: (x: string): number => parseInt(x),    // not used
            isFoilSelector: 'div.caption > div.name > a',
            expansionSelector: 'div.caption > div.description > p > a',

            imgSelector: 'div.image > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'data-src',

            productSelector: 'div.image > a',
            productBaseUrl: 'https://www.manaleak.com/',
            productRefAttribute: 'href',
        });
    }

    // @Override
    stockFromResultNode = (resultNode: Element): Stock => {
        // Stock count is not displayed. An out of stock banner either is or is not present.
        let isInStock: boolean = resultNode.querySelectorAll(this.stockSelector).length === 0;
        return isInStock ? { inStock: true, level: '' + 1 } : { inStock: false, level: '' + 0 };
    }
}

export default PriceGetter_ManaLeak;
