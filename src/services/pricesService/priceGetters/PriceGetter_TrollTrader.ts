import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_TrollTrader extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Troll Trader',
            dataGetter: new DataGetter_TrollTrader(),
            processorSelector: new ProcessorSelector_TrollTrader(),
        });
    }
}

class DataGetter_TrollTrader extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.trolltradercards.com/',
            searchPath: 'products/search?q=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class ProcessorSelector_TrollTrader extends AbstractProcessorSelector {
    constructor() {
        super([new DataProcessor_TrollTrader()]);
    }
}

class DataProcessor_TrollTrader extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Troll Trader',
            currencyCode: 'GBP',

            resultSelector: 'div.products-container > ul > li.product',
            titleSelector: 'div.inner > div > div.meta > a > h4',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.inner > div > div.meta > span.offers > span.price',
            priceValueFromPriceText: (text: string): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div.inner > div > div.meta > span.offers > span.qty',
            stockValueFromStockText: (text: string): number => text === undefined ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: 'div.inner > div > div.meta > a > h4',
            expansionSelector: 'div.inner > div > div.meta > span.category',

            imgSelector: 'div.inner > div > div.image > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div.inner > div > div.image > a',
            productBaseUrl: 'https://www.trolltradercards.com/',
            productRefAttribute: 'href',
        });
    }
}

export default PriceGetter_TrollTrader;
