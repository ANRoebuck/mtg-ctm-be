import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';


class PriceGetter_PatriotGamesLeeds extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Patriot Games Leeds',
            dataGetter: new DataGetter_PatriotGamesLeeds(),
            dataProcessor: new DataProceesor_PatriotGamesLeeds(),
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

class DataProceesor_PatriotGamesLeeds extends AbstractHtmlDataProcessor {
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
    stockFromResultNode = (resultNode: Element): Stock => [...resultNode.querySelectorAll(this.stockSelector)]
        .map(node => {
            const isInStock: boolean = node.innerHTML !== '... more info';
            return isInStock ? { inStock: true, level: '' + 1 } : { inStock: false, level: '' + 0 };
        })[0];

    // @Override
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => (node.innerHTML.replace(/.*Set:(.*)Rarity.*/, `$1`)))[0];

}

export default PriceGetter_PatriotGamesLeeds;
