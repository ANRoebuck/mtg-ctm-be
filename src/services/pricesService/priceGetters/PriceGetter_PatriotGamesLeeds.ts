import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Patriot Games Leeds';

class PriceGetter_PatriotGamesLeeds extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_PatriotGamesLeeds(),
            dataProcessor: new DataProceesor_PatriotGamesLeeds(),
        });
    }
}

class DataGetter_PatriotGamesLeeds extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'https://www.patriotgamesleeds.com/',
            searchPath: 'index.php?main_page=advanced_search_result&search_in_description=1&keyword=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProceesor_PatriotGamesLeeds extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: '#productListing > table > tbody> tr',
            titleSelector: 'td > h3.itemTitle > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'td.productListing-data > span.productBasePrice',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),
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
    stockFromResultNode = (resultNode: Element): Stock => {
        // Stock count is not displayed. An out of stock banner either is or is not present.
        let isInStock: boolean = resultNode.querySelectorAll(this.stockSelector).length === 0;
        return isInStock ? { inStock: true, level: '1' } : { inStock: false, level: '0' };
    }

    // @Override
    expansionFromResultNode = (resultNode: Element): string => {
        return this.getFirstElementHtml(resultNode, this.expansionSelector)
            .replace(/.*Set:(.*)Rarity.*/, `$1`);
    }
}

export default PriceGetter_PatriotGamesLeeds;
