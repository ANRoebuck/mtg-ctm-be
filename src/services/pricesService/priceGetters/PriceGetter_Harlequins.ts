import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_Harlequins extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Harlequins',
            dataGetter: new DataGetter_Harlequins(),
            processorSelector: new ProcessorSelector_Harlequins(),
        });
    }
}

class DataGetter_Harlequins extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.harlequins-games.com/',
            searchPath: 'products/search?q=',
            searchSuffix: '&c=8&disable_mobile=1',
            searchJoin: '+',
        });
    }
}

class ProcessorSelector_Harlequins extends AbstractProcessorSelector {
    constructor() {
        super([new DataProcessor_Harlequins()]);
    }
}

class DataProcessor_Harlequins extends AbstractDataProcessor {
    constructor() {
        super({
            seller: 'Harlequins',

            resultSelector: 'ul.products > li.product',
            titleSelector: 'div.inner > div > div.meta > a > h4',

            useSubResults: true,
            subresultSelector: 'div.inner > div.variants > div.variant-row',
            subtitleSelector: 'span > span.variant-short-info.variant-description',
            subtitleFromText: (x: string): string => x,

            priceSelector: 'div.inner > div.variants > div.variant-row > span > form > div > span.regular',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'span > span.variant-short-info.variant-qty',
            stockValueFromStockText: (text) => text === 'Out of stock.' ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: 'div.inner > div > div.meta > a > h4',
            expansionSelector: 'div.inner > div > div.meta > a > span.category',

            imgSelector: 'div.inner > div > div.image > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div.inner > div > div.image > a',
            productBaseUrl: 'https://www.harlequins-games.com',
            productRefAttribute: 'href',
        });
    }
}

export default PriceGetter_Harlequins;
