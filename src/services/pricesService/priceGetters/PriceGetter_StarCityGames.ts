import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';

const sellerName = 'Star City Games';

class PriceGetter_StarCityGames extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_StarCityGames(),
            dataProcessor: new DataProcessor_StarCityGames(),
        });
    }
}

class DataGetter_StarCityGames extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://starcitygames.hawksearch.com/',
            searchPath: 'sites/starcitygames/?search_query=',
            searchSuffix: '&ajax=1&json=1&hawkcustom=undefined&hawkvisitorid=foo&callback=jQuery3410974876865918253_1633569817522&_=1633569817523',
            searchJoin: '%20',
        });
    }

    // @Override
    extractData = ({ data } : { data: string }): string  => {
        // use [\s\S] instead of . to include matching new line char
        let str = data.replace(/.*\((\{[\s\S]*\})\)/g, `$1`);
        // console.log(typeof  str);
        // console.log(str.split('').slice(0,50));
        // console.log(str);

        // local tests do not work but the model works live
        // suspected issue with json parsing

        let o;
        try {
            o = JSON.parse(str);
        } catch (e) {
            console.log(e);
        }
        // console.log(o);

        return o.html ;
    };
}

class DataProcessor_StarCityGames extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currencyCode: 'USD',

            resultSelector: 'div > div.hawk-results-item',
            titleSelector: 'div > div > h2 > a',

            useSubResults: true,
            subresultSelector: 'div > div > div > div > div.hawk-results-item__options-table-row',
            subtitleSelector: 'div.hawk-results-item__options-table-cell.hawk-results-item__options-table-cell--name',
            subtitleFromText: removeTags,

            priceSelector: 'div.hawk-results-item__options-table-cell.hawk-results-item__options-table-cell--price',
            priceValueFromPriceText: (text: string): number => parseInt((removeTags(text)).replace(/\D/g,'')),
            stockSelector: 'div.hawk-results-item__options-table-cell.hawk-results-item__options-table-cell--qty',
            stockValueFromStockText: (text: string): number => text === 'Out of stock.' ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: 'div > div > p > a',
            expansionSelector: 'div > div > p > a',

            imgSelector: 'div > div > div > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div > div > h2 > a',
            productBaseUrl: 'https://starcitygames.com',
            productRefAttribute: 'href',
        });
    }
}

const removeTags = (text: string): string => text.replace(/<.*?>/g, '')

export default PriceGetter_StarCityGames;
