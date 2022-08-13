import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';


class PriceGetter_LazyDragonGaming extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Lazy Dragon Gaming',
            dataGetter: new DataGetter_LazyDragonGaming(),
            dataProcessor: new DataProcessor_LazyDragonGaming(),
        });
    }
}

class DataGetter_LazyDragonGaming extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.lazydragongaming.com/',
            searchPath: 'search?q=*',
            searchSuffix: '*',
            searchJoin: '+',
        });
    }
}

class DataProcessor_LazyDragonGaming extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Lazy Dragon Gaming',
            currencyCode: 'GBP',

            resultSelector: 'div.collectionGrid > div.productCard__card',
            titleSelector: 'div.productCard__lower > p.productCard__title > a',

            useSubResults: true,
            subresultSelector: 'div > ul > li.productChip',
            subtitleSelector: OVERRIDDEN_METHOD,
            subtitleFromText: (x: string): string => x,

            priceSelector: OVERRIDDEN_METHOD,
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: OVERRIDDEN_METHOD,
            stockValueFromStockText: (x: string): number => parseInt(x),    // not used
            isFoilSelector: OVERRIDDEN_METHOD,
            expansionSelector: 'div > p.productCard__setName',

            imgSelector: 'div > a > div.productCard__imageWrap > img',
            imgBaseUrl: 'https://',
            imgSrcAttribute: 'data-src',

            productSelector: 'div > p.productCard__title > a',
            productBaseUrl: 'https://www.lazydragongaming.com',
            productRefAttribute: 'href',
        });
    }

    // @Override
    subtitleFromResultNode = (resultNode: Element): string => resultNode.getAttribute('data-varianttitle') || '';

    // @Override
    priceFromResultNode = (resultNode: Element): number => {
        const nodeText: string | null = resultNode.getAttribute('data-variantprice');
        return nodeText ? this.priceValueFromPriceText(nodeText) : 999999;
    }

    // @Override
    stockFromResultNode = (resultNode: Element): Stock => {
        // Only in stock results are shown
        const value: string = resultNode.getAttribute('data-variantqty') || '0';
        return { inStock: true, level: value };
    }

    // @Override
    isFoilFromResultNode = (resultNode: Element): boolean => this.isFoilFromTitle(this.subtitleFromResultNode(resultNode));
}

const OVERRIDDEN_METHOD: string = 'this method is overriden';

export default PriceGetter_LazyDragonGaming;
