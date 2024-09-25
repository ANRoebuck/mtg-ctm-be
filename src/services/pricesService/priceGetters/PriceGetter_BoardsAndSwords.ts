import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Boards & Swords';

class PriceGetter_BoardsAndSwords extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_BoardsAndSwords(),
            dataProcessor: new DataProcessor_BoardsAndSwords(),
        });
    }
}

class DataGetter_BoardsAndSwords extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'https://www.boardsandswords.co.uk/',
            searchPath: 'search?type=product&options%5Bprefix%5D=last&q=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_BoardsAndSwords extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'div.collectionGrid > div.productCard__card',
            titleSelector: 'div.productCard__lower > p.productCard__title > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.productCard__lower > p.productCard__price',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div.productCard__button',
            stockValueFromStockText: (x: string): number => parseInt(x),    // not used
            isFoilSelector: 'div.productCard__lower > p.productCard__title > a',
            expansionSelector: 'div.productCard__lower > p.productCard__setName',

            imgSelector: 'div.productCard__upper > a > div.productCard__imageWrap > img',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'data-src',

            productSelector: 'div.productCard__lower > p.productCard__title > a',
            productBaseUrl: 'https://www.boardsandswords.co.uk',
            productRefAttribute: 'href',
        });
    }

        // @Override
        stockFromResultNode = (resultNode: Element): Stock => {
            // Stock count is not displayed. An out of stock banner either is or is not present.
            let isInStock: boolean = resultNode.querySelectorAll(this.stockSelector).length === 0;
            return isInStock ? { inStock: true, level: '1' } : { inStock: false, level: '0' };
        }
}

export default PriceGetter_BoardsAndSwords;
