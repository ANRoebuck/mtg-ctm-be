import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';
import { StockStatus } from "../../../types/Price";


class PriceGetter_NerdShak extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Nerd Shak',
            dataGetter: new DataGetter_NerdShak(),
            processorSelector: new ProcessorSelector_NerdShak(),
        });
    }
}

class DataGetter_NerdShak extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://nerdshak.com/',
            searchPath: 'search?q=*',
            searchSuffix: '*',
            searchJoin: '+',
        });
    }
}

class ProcessorSelector_NerdShak extends AbstractProcessorSelector {
    constructor() {
        super([new DataProcessor_NerdShak()]);
    }
}

class DataProcessor_NerdShak extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Nerd Shak',

            resultSelector: 'div > div.row > div.col-md-4',
            titleSelector: 'div > p.productTitle',

            useSubResults: true,
            subresultSelector: 'div > div.hoverMask > div > div.addNow ',
            subtitleSelector: 'p',
            subtitleFromText: (text: string): string => text.replace(/(.*)[-~](.*)/, `$1`), //pre-dash text

            priceSelector: 'p',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'p',
            stockValueFromStockText: (x: string): number => parseInt(x),    // not used
            isFoilSelector: 'div > p.productTitle',
            expansionSelector: 'div > p.productTitle',

            imgSelector: 'div > div.imgWrapper > img.items-even',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div > div > div.view > a',
            productBaseUrl: 'https://nerdshak.com',
            productRefAttribute: 'href',
        });
    }

    // @Override
    titleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.titleSelector)]
        .map(node => node.innerHTML
            .replace(/(.*)\[.*/g, `$1`)                 // take first segment before opening [
            .replace(/<br>/, '')                        // remove linebreak html
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)    // remove leading+trailing whitespace
            .replace(/[【】《》\[\]■ ◆]/g, ' ')               // remove weird brackets
        )[0] || '';

    // @Override
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => node.innerHTML.replace(/.*\[(.*)\]/g, `$1`))[0] || '';

    // @Override
    stockFromResultNode = (resultNode: Element): StockStatus => ({ inStock: true, stock: 1 });  // Only in stock results are shown
}

export default PriceGetter_NerdShak;
