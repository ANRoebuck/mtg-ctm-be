import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Magic Card Trader';

class PriceGetter_MagicCardTrader extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_MagicCardTrader(),
            dataProcessor: new DataProcessor_MagicCardTrader(),
        });
    }
}

class DataGetter_MagicCardTrader extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
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
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'div.products-container > ul > li',
            titleSelector: 'div.inner > div.image-meta > div.meta > a > h4.name',

            useSubResults: true,
            subresultSelector: 'div.inner > div.variants > div.variant-row',
            subtitleSelector: 'span.variant-main-info > span.variant-description',
            subtitleFromText: (x) => x,

            priceSelector: 'span.variant-buttons > form > div.product-price-qty > span',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'span.variant-main-info > span.variant-qty',
            stockValueFromStockText: (text) => text === 'Out of stock' ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: 'span.variant-main-info > span.variant-description',
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
    isFoilFromResultNode = (resultNode: Element): boolean => {
        const html = this.getFirstElementHtml(resultNode, this.isFoilSelector);
        return this.isFoilFromString(html.toLowerCase()) || this.isFoilFromString(this.titleFromResultNode(resultNode));
    }
}

export default PriceGetter_MagicCardTrader;
