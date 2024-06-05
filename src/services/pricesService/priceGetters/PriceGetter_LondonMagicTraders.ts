import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

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
            searchPath: 'search?q=',
            searchSuffix: '&options%5Bprefix%5D=last&filter.v.availability=1',
            searchJoin: '+',
        });
    }
}

class DataProcessor_LondonMagicTraders extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'div > ul > li.grid__item',
            titleSelector: 'div.card-wrapper > div > div.card__content > div.card__information > h3 > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.card-wrapper > div > div.card__content > div.card__information > div.card-information > div > div.price__container > div.price__regular > span.price-item',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: '', // not used
            stockValueFromStockText: (_: string): number => 1, // not used
            isFoilSelector: 'div.card-wrapper > div > div.card__content > div.card__information > h3 > a',
            expansionSelector: 'div.card-wrapper > div > div.card__content > div.card__information > h3 > a',

            imgSelector: 'div.card-wrapper > div > div.card__inner > div.card__media > div.media > img',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'src',

            productSelector: 'div.card-wrapper > div > div.card__inner > div.card__content > div.card__information > h3 > a',
            productBaseUrl: 'https://londonmagictraders.com',
            productRefAttribute: 'href',
        });
    }

    // @Override
    titleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.titleSelector)]
        .map(node => node.innerHTML
                .replace(/(.*)[-~](.*)/, `$1`)                  // pre-dash text
                .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)   // remove leading+trailing whitespace
        )[0] || '';

    // @Override
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => node.innerHTML
                .replace(/(.*)[-~](.*)/, `$2`)                  // post-dash text
                .replace(/<br>/, '')                            // remove linebreak html
                .replace(/(.*)\[.*/g, `$1`)                     // take first segment before opening [
                .replace(/(.*)\[.*/g, `$1`)                     // take first segment before opening [      // removing two sets []
                .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)   // remove leading+trailing whitespace
        )[0] || '';

    // @Override
    stockFromResultNode = (_: Element): Stock => ({ inStock: true, level: '' + 1 });  // Only in stock results are shown
}

export default PriceGetter_LondonMagicTraders;
