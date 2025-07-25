import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = 'Manaleak';

class PriceGetter_Manaleak extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_Manaleak(),
            dataProcessor: new DataProcessor_Manaleak(),
        });
    }
}

class DataGetter_Manaleak extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'https://www.manaleak.com/',
            searchPath: '/index.php?route=product/search&search=',
            searchSuffix: '#/availability=1',
            searchJoin: '+',
        });
    }
}

class DataProcessor_Manaleak extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

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
            productBaseUrl: '',
            productRefAttribute: 'href',
        });
    }

    // @Override
    stockFromResultNode = (resultNode: Element): Stock => {
        // Stock count is not displayed. An out of stock banner either is or is not present.
        let isInStock: boolean = resultNode.querySelectorAll(this.stockSelector).length === 0;
        return isInStock ? { inStock: true, level: '' + 1 } : { inStock: false, level: '' + 0 };
    }

    // @Override
    productRefFromResultNode = (resultNode: Element): string => {
        const attributeValue = this.getFirstelementAttr(resultNode, this.productSelector, this.productRefAttribute);
        return this.productBaseUrl + new StringCleaner(attributeValue).trimWhitespace().get();
    }
}

export default PriceGetter_Manaleak;
