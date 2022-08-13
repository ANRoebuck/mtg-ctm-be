import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';


class PriceGetter_MagicCardTrader extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Magic Card Trader',
            dataGetter: new DataGetter_MagicCardTrader(),
            dataProcessor: new DataProcessor_MagicCardTrader(),
        });
    }
}

class DataGetter_MagicCardTrader extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.themagiccardtrader.com/',
            searchPath: 'products/search?q=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_MagicCardTrader extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Magic Card Trader',
            currencyCode: 'GBP',

            resultSelector: 'div.products-container > ul > li',
            titleSelector: 'div.inner > div.image-meta > div.meta > a > h4.name',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.inner > div.variants > div.variant-row > span.variant-buttons > form > div.product-price-qty > span',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div.inner > div.variants > div.variant-row > span.variant-main-info > span.variant-qty',
            stockValueFromStockText: (text) => text === 'Out of stock' ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: 'div.inner > div.variants > div.variant-row > span.variant-main-info > span.variant-description',
            expansionSelector: 'div.inner > div.image-meta > div.meta > a > span.category',

            imgSelector: 'div.inner > div.image-meta > div.image > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div.inner > div.image-meta > div.image > a',
            productBaseUrl: 'https://www.themagiccardtrader.com/',
            productRefAttribute: 'href',
        });
    }

    // @Override
    isFoilFromResultNode = (resultNode: Element): boolean => [...resultNode.querySelectorAll(this.isFoilSelector)]
            .map(node => node.innerHTML)
            .map(text => this.isFoilFromTitle(text.toLowerCase()))
            [0] || this.isFoilFromTitle(this.titleFromResultNode(resultNode));
}

export default PriceGetter_MagicCardTrader;
