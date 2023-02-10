import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';

const sellerName = 'Dice Saloon';

class PriceGetter_DiceSaloon extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_DiceSaloon(),
            dataProcessor: new DataProcessor_DiceSaloon(),
        });
    }
}

class DataGetter_DiceSaloon extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.dicesaloonsingles.com/',
            searchPath: 'products?keywords=',
            searchSuffix: '&search%5Bin_stock%5D%5B%5D=true',
            searchJoin: '+'
        });
    }
}

class DataProcessor_DiceSaloon extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currencyCode: 'GBP',

            resultSelector: 'div.row > div.product-list-item',
            titleSelector: 'div > div > span.info',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div > div > p > strong',
            priceValueFromPriceText: (text: string): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div > div > p > span:nth-child(3)',
            stockValueFromStockText: (text: string): number => text === 'Out of stock.' ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: 'div > div > span.info',
            expansionSelector: 'div > div > span.info',

            imgSelector: 'div > figure > a > img',
            imgBaseUrl: 'https://www.dicesaloonsingles.com',
            imgSrcAttribute: 'src',

            productSelector: 'div > figure > a',
            productBaseUrl: 'https://www.dicesaloonsingles.com',
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
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => node.innerHTML
            .replace(/(.*)-(.*)/g, `$2`)                     // take segment after -
            .replace(/(.*)Foil/g, `$1`)                      // remove trailing FOIL if present
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)    // remove leading+trailing whitespace
        )[0] || '';

}

export default PriceGetter_DiceSaloon;
