import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';


class PriceGetter_Hareruya extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Hareruya',
            dataGetter: new DataGetter_Hareruya(),
            dataProcessor: new DataProcessor_Hareruya(),
        });
    }
}

class DataGetter_Hareruya extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.hareruyamtg.com/en/',
            searchPath: 'products/search?suggest_type=all&product=',
            searchSuffix: '&image=%EE%A4%84',
            searchJoin: '+',
        });
    }
}

class DataProcessor_Hareruya extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Hareruya',
            currencyCode: 'JPY',

            resultSelector: 'ul.itemListLine > li.itemList',
            titleSelector: 'div.itemData > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'div.itemData > div.itemDetail > p.itemDetail__price',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),
            stockSelector: 'div.itemData > div.itemDetail > p.itemDetail__stock',
            stockValueFromStockText: (text): number => parseInt(text.replace(/\D/g,'')),
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
    titleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.titleSelector)]
        .map(node => node.innerHTML
                .replace(/(.*)\[.*/g, `$1`)                      // take first segment before opening [
                .replace(/[【】《》\[\]■ ◆]/g, ' ')               // remove weird brackets
                .replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`)    // remove leading+trailing whitespace
        )[0] || '';

    // @Override
    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map(node => node.innerHTML.replace(/.*\[(.*)\]/g, `$1`))[0] || '';
}

export default PriceGetter_Hareruya;
