import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_Axion extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Axion Now',
            dataGetter: new DataGetter_Axion(),
            processorSelector: new ProcessorSelector_Axion(),
        });
    }
}

class DataGetter_Axion extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.axionnow.com/',
            searchPath: 'products/search?q=',
            searchSuffix: '',
            searchJoin: '+'
        });
    }
}

class ProcessorSelector_Axion extends AbstractProcessorSelector {
    constructor() {
        super([new DataProcessor_Axion()]);
    }
}

class DataProcessor_Axion extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Axion Now',

            resultSelector: 'ul.products > li.product',
            titleSelector: 'div.inner > div > div.meta > a > h4',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.inner > div > div.meta > div.list-variants.grid > div > span > form > div > span.regular',
            priceValueFromPriceText: (text: string): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div.inner > div > div.meta > div> div > span.variant-main-info > span.variant-qty',
            stockValueFromStockText: (text: string): number => text === 'Out of stock.' ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: 'div.inner > div > div.meta > a > h4',
            expansionSelector: 'div.inner > div > div.meta > a > span.category',

            imgSelector: 'div.inner > div > div.image > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div.inner > div > div.image > a',
            productBaseUrl: 'https://www.axionnow.com/',
            productRefAttribute: 'href',
        });
    }
}

export default PriceGetter_Axion;
