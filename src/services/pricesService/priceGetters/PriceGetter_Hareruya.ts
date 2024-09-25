import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Hareruya';

class PriceGetter_Hareruya extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_Hareruya(),
            dataProcessor: new DataProcessor_Hareruya(),
        });
    }
}

class DataGetter_Hareruya extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'https://www.hareruyamtg.com/en/',
            searchPath: 'products/search?suggest_type=all&product=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_Hareruya extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.JPY,

            resultSelector: 'ul.itemListLine > li.itemList',
            titleSelector: 'div.itemData > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.itemData > div.itemDetail > p.itemDetail__price',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),
            stockSelector: 'div.itemData > div.itemDetail > p.itemDetail__stock',
            stockValueFromStockText: (text): number => parseInt(text.replace(/\D/g, '')),
            isFoilSelector: 'div.itemData > a',
            expansionSelector: 'div.itemData > a',

            imgSelector: 'a> div.itemImg > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'data-original',

            productSelector: 'div.itemData > a',
            productBaseUrl: 'https://www.hareruyamtg.com',
            productRefAttribute: 'href',
        });
    }

    // @Override
    titleFromResultNode = (resultNode: Element): string => {
        return this.getFirstElementHtml(resultNode, this.titleSelector)
            .replace(/(.*)\[.*/g, `$1`)                      // take first segment before opening [
            .replace(/[【】《》\[\]■ ◆]/g, ' ')               // remove weird brackets
            .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)    // remove leading+trailing whitespace
    }

    // @Override
    expansionFromResultNode = (resultNode: Element): string => {
        return this.getFirstElementHtml(resultNode, this.expansionSelector)
            .replace(/.*\[(.*)\]/g, `$1`);
    }
}

export default PriceGetter_Hareruya;
