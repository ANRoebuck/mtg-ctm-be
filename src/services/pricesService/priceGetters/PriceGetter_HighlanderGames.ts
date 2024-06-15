import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Highlander Games';

class PriceGetter_HighlanderGames extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_HighlanderGames(),
            dataProcessor: new DataProcessor_HighlanderGames(),
        });
    }
}

class DataGetter_HighlanderGames extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://highlandergames.co.uk/search?type=product&q=',
            searchPath: 'search?type=product&q=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_HighlanderGames extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'div.grid-uniform > div.grid-item',
            titleSelector: 'a > p',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'a > div.product-item--price > span > small',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),
            stockSelector: 'a > div > div > div.badge > span',
            stockValueFromStockText: () => 1,   // not used
            isFoilSelector: 'a > p',
            expansionSelector: 'a > p',

            imgSelector: 'a> div.product-grid-image > div > div > div > img',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'data-src',

            productSelector: 'a',
            productBaseUrl: 'https://highlandergames.co.uk',
            productRefAttribute: 'href',
        });
    }

    // @Override
    titleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.titleSelector)]
        .map(node => node.innerHTML
            .replace(/(.*)-(.*)/g, `$1`)                     // take segment before -
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)    // remove leading+trailing whitespace
        )[0] || '';

    // @Override
    stockFromResultNode = (resultNode: Element): Stock => {
        // Stock count is not displayed. An out of stock banner either is or is not present.
        let isInStock: boolean = resultNode.querySelectorAll(this.stockSelector).length === 0;
        return isInStock ? { inStock: true, level: '1' } : { inStock: false, level: '0' };
    }

    // @Override
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => node.innerHTML
            .replace(/(.*)-(.*)/g, `$2`)                     // take segment after -
            .replace(/(.*)Foil/g, `$1`)                      // remove trailing FOIL if present
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)    // remove leading+trailing whitespace
        )[0] || '';

    // @Override
    imgSrcFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.imgSelector)]
        .map((node: Element): string => {
            const imgSrc = node.getAttribute(this.imgSrcAttribute)?.replace('{width}', '180');
            return this.imgBaseUrl + imgSrc;
        })[0] || '';

}

export default PriceGetter_HighlanderGames;
