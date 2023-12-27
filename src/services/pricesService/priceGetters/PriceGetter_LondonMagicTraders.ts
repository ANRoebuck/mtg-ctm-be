import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';

const sellerName = 'London Magic Traders';

class PriceGetter_LondonMagicTraders extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_LondonMagicTraders(),
            dataProcessor: new DataProcessor_LondonMagicTraders(),
        });
    }
}

class DataGetter_LondonMagicTraders extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://londonmagictraders.com/',
            searchPath: 'search?q=*',
            searchSuffix: '*',
            searchJoin: '+',
        });
    }
}

class DataProcessor_LondonMagicTraders extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currencyCode: 'GBP',

            resultSelector: 'div > div.row > div.col-md-4',
            titleSelector: 'div > p.productTitle',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div > p.productPrice',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'p',
            stockValueFromStockText: (x: string): number => parseInt(x),    // not used
            isFoilSelector: 'div > p.productTitle',
            expansionSelector: 'div > p.productTitle',

            imgSelector: 'div > div.imgWrapper > img.items-even',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div > div > div.view > a',
            productBaseUrl: 'https://londonmagictraders.com',
            productRefAttribute: 'href',
        });
    }

    // @Override
    titleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.titleSelector)]
        .map(node => node.innerHTML
                .replace(/(.*)[-~](.*)/, `$1`)              // pre-dash text
                .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)    // remove leading+trailing whitespace
        )[0] || '';

    // @Override
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => node.innerHTML
                .replace(/(.*)[-~](.*)/, `$2`)              // post-dash text
                .replace(/<br>/, '')                        // remove linebreak html
                .replace(/(.*)\[.*/g, `$1`)                 // take first segment before opening [
                .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)    // remove leading+trailing whitespace
        )[0] || '';

    // @Override
    stockFromResultNode = (resultNode: Element): Stock => {
        const price: number | null = this.priceFromResultNode(resultNode);
        return price ? { inStock: true, level: '' + 1 } : { inStock: false, level: '' + 0 };
    }
}

export default PriceGetter_LondonMagicTraders;
