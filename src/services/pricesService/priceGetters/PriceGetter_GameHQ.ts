import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';
import { Stock } from './AbstractDataProcessor';

const sellerName = 'Game HQ';

class PriceGetter_GameHQ extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_GameHQ(),
            dataProcessor: new DataProcessor_GameHQ(),
        });
    }
}

class DataGetter_GameHQ extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'https://www.game-hq.co.uk/',
            searchPath: 'search?options%5Bprefix%5D=last&type=product&q=',
            searchSuffix: '',
            searchJoin: '+'
        });
    }
}

class DataProcessor_GameHQ extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'div.list-view-items > div > div.grid-view-item > div.grid-view-item__link',
            titleSelector: 'div > a > div.product-detail > div.h4',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div > div > div.product-price > span.product-price__price',
            priceValueFromPriceText: (text: string): number => parseInt(text.replace(/\D/g, '')),
            stockSelector: 'div.nm-cartmain > form > div.product-form__item > a > span.value',
            stockValueFromStockText: (x: string): number => parseInt(x),    // not used
            isFoilSelector: 'div > span > select > option',
            expansionSelector: 'div > a > div.product-detail > div.h4',

            imgSelector: 'div.product-card-list2__image-wrapper > a > div > div > img',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'src',

            productSelector: 'div.product-card-list2__image-wrapper > a',
            productBaseUrl: 'https://www.game-hq.co.uk',
            productRefAttribute: 'href',
        });
    }

    // @Override
    stockFromResultNode = (resultNode: Element): Stock => {
        // Stock count is not displayed
        // Out of stock banner loads lazily and cannot be used
        // There is a tool-tip element displayed when hovering over add-to-cart button
        // The text from this element is either 'SOLD OUT' or 'Add To Cart'
        // The add-to-cart button itself may be absent, in which case item is out of stock
        const addToCartToolTipElement: string = this.getFirstElementHtml(resultNode, this.stockSelector);
        const inStock: boolean = addToCartToolTipElement?.includes('Add To Cart') || false;
        return {
            inStock,
            level: inStock ? '1' : '0'
        };
    }

    // @Override
    titleFromResultNode = (resultNode: Element): string => {
        const title: string = this.getFirstElementHtml(resultNode, this.titleSelector)
            .replace(/(.*)\[(.*)\]/g, `$1`)                     // ignore segment in [square brackets]
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);      // remove leading+trailing whitespace

        let subtitle: string = this.getFirstElementWithAttrHtml(resultNode, this.isFoilSelector, 'selected')
            .replace(/\n/, '')                                  // remove new line characters
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);      // remove leading+trailing whitespace
        subtitle = subtitle && ` - ${subtitle}`;

        return `${title}${subtitle}`;
    }

    // @Override
    expansionFromResultNode = (resultNode: Element): string => {
        return this.getFirstElementHtml(resultNode, this.expansionSelector)
            .replace(/(.*)\[(.*)\]/g, `$2`)                     // take segment in [square brackets]
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);      // remove leading+trailing whitespace
    }

}

export default PriceGetter_GameHQ;
