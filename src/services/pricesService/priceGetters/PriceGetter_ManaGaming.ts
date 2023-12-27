import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';

const sellerName = 'Mana Gaming';

class PriceGetter_ManaGaming extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_ManaGaming(),
            dataProcessor: new DataProcessor_ManaGaming(),
        });
    }
}

class DataGetter_ManaGaming extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://managaming.shop/',
            searchPath: 'search?page=1&q=%2A',
            searchSuffix: '%2A',
            searchJoin: '%20',
        });
    }
}

class DataProcessor_ManaGaming extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currencyCode: 'GBP',

            resultSelector: 'div.collectionGrid > div.productCard__card',
            titleSelector: 'div.productCard__lower > p.productCard__title > a',

            useSubResults: true,
            subresultSelector: 'div.productCard__lower > ul > li',
            subtitleSelector: 'data-varianttitle', // attribute
            subtitleFromText: () => '', // not used

            priceSelector: 'data-variantprice', // attribute
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'data-variantqty', // attribute
            stockValueFromStockText: () => 1, // not used
            isFoilSelector: 'div.inner > div > div.meta > a > h4',
            expansionSelector: 'div.productCard__lower > p.productCard__setName',

            imgSelector: 'div.productCard__upper > a > div > img',
            imgBaseUrl: 'https:',
            imgSrcAttribute: 'data-src',

            productSelector: 'div.productCard__upper > a',
            productBaseUrl: 'https://managaming.shop',
            productRefAttribute: 'href',
        });


    }

    // @Override
    stockFromResultNode = (resultNode: Element): Stock => {
            const value = resultNode.getAttribute(this.stockSelector) || 0;
            return {
                inStock: value > 0,
                level: '' + value,
            };
        };

    // @Override
    priceFromResultNode = (resultNode: Element): number => this.priceValueFromPriceText(resultNode.getAttribute(this.priceSelector) || '0');

    // @Override
    subtitleFromResultNode = (resultNode: Element): string => resultNode.getAttribute(this.subtitleSelector) || '';
}

export default PriceGetter_ManaGaming;
