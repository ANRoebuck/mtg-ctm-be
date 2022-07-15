import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';
import { JSDOM } from "jsdom";
import { StockStatus } from "../../../types/Price";


class PriceGetter_PatriotGamesLeeds extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Patriot Games Leeds',
            dataGetter: new DataGetter_PatriotGamesLeeds(),
            processorSelector: new ProcessorSelector_PatriotGamesLeeds(),
        });
    }
}

class DataGetter_PatriotGamesLeeds extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'http://www.patriotgamesleeds.com/',
            searchPath: 'index.php?main_page=advanced_search_result&search_in_description=1&keyword=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class ProcessorSelector_PatriotGamesLeeds extends AbstractProcessorSelector {
    constructor() {
        super([
            new DataProceesor_PatriotGamesLeeds_Desktop(),
            new DataProceesor_PatriotGamesLeeds_Mobile()
        ]);
    }

    getProcessor = (rawData: string) => {
        const document: Document = new JSDOM(rawData).window.document;
        // resultsSelector
        const desktopElements = document.querySelectorAll('#productListing > table > tbody> tr');
        return desktopElements.length > 0 ? this.dataProcessors[0] : this.dataProcessors[1];
    };
}

class DataProceesor_PatriotGamesLeeds_Desktop extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Patriot Games Leeds',
            currencyCode: 'GBP',

            resultSelector: '#productListing > table > tbody> tr',
            titleSelector: 'td > h3.itemTitle > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'td.productListing-data > span.productBasePrice',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'td[align="right"] > a',
            stockValueFromStockText: (x: string): number => parseInt(x),    // not used
            isFoilSelector: 'td > h3.itemTitle > a',
            expansionSelector: 'td.productListing-data > div.listingDescription',

            imgSelector: 'td.productListing-data > a > img',
            imgBaseUrl: 'http://www.patriotgamesleeds.com/',
            imgSrcAttribute: 'src',

            productSelector: 'td.productListing-data > a',
            productBaseUrl: '',
            productRefAttribute: 'href',
        });
    }

    // @Override
    stockFromResultNode = (resultNode: Element): StockStatus => [...resultNode.querySelectorAll(this.stockSelector)]
        .map(node => {
            const isInStock: boolean = node.innerHTML !== '... more info';
            return isInStock ? { inStock: true, stock: 1 } : { inStock: false, stock: 0 };
        })[0];

    // @Override
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => (node.innerHTML.replace(/.*Set:(.*)Rarity.*/, `$1`)))[0];

}

class DataProceesor_PatriotGamesLeeds_Mobile extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Patriot Games Leeds',
            currencyCode: 'GBP',

            resultSelector: 'div.listing > div',
            titleSelector: 'div > h3 > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div > div.list-price > span',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div > div.multiple-add-to-cart > div',
            stockValueFromStockText: (x: string): number => parseInt(x),    // not used
            isFoilSelector: 'div > h3 > a',
            expansionSelector: 'div > div.listingDescription',

            imgSelector: 'div > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div > h3 > a',
            productBaseUrl: '',
            productRefAttribute: 'href',
        });
    }

    // @Override
    stockFromResultNode = (resultNode: Element): StockStatus => {
        // Stock count is not displayed. Add to basket either is or is not displayed
        let isInStock: boolean = resultNode.querySelectorAll(this.stockSelector).length > 0;
        return isInStock ? { inStock: true, stock: 1 } : { inStock: false, stock: 0 };
    }

    // @Override
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => (node.innerHTML.replace(/.*Set:(.*)Rarity.*/, `$1`)))[0];

}

export default PriceGetter_PatriotGamesLeeds;
