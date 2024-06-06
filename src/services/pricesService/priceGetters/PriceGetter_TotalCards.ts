import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';
import StringCleaner from '../../../utils/StringCleaner';

const sellerName = 'Total Cards';

class PriceGetter_TotalCards extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_TotalCards(),
            dataProcessor: new DataProcessor_TotalCards(),
        });
    }
}

class DataGetter_TotalCards extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://totalcards.net/',
            searchPath: 'search?type=product&options%5Bprefix%5D=last&q=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_TotalCards extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'div#search-item-wrapper > div > div.box-inner',
            titleSelector: 'div.product-footer > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.product-footer > div.price-box',
            priceValueFromPriceText: (text: string): number => parseInt(text.replace(/\D/g, '')),
            stockSelector: 'div.product-image > div.badge-wrap > span.badge.sold-out',
            stockValueFromStockText: (x: string): number => parseInt(x),    // not used
            isFoilSelector: 'div.product-footer > a',
            expansionSelector: 'div.product-footer > a',

            imgSelector: 'div.product-card-list2__image-wrapper > a > div > div > img',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'src',

            productSelector: 'div.product-card-list2__image-wrapper > a',
            productBaseUrl: 'https://lvlupgaming.co.uk',
            productRefAttribute: 'href',
        });
    }

    // @Override
    stockFromResultNode = (resultNode: Element): Stock => {
        // Stock count is not displayed. An out of stock banner either is or is not present.
        let isInStock: boolean = resultNode.querySelectorAll(this.stockSelector).length === 0;
        return isInStock ? { inStock: true, level: '1' } : { inStock: false, level: '0' };
    }

    // @Override
    titleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.titleSelector)]
        .map((node: Element): string => new StringCleaner(node.innerHTML)
            .splitOnSymbolAndSelectSection('-', 2)
            .trimWhitespace()
            .get()
        )[0] || '';


    // @Override
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => new StringCleaner(node.innerHTML)
            .splitOnSymbolAndSelectSection('-', 1)
            .trimWhitespace()
            .get()
        )[0] || '';
}

export default PriceGetter_TotalCards;
