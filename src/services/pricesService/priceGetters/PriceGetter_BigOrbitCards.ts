import AbstractDataGetter from './abstract/AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';


class PriceGetter_BigOrbitCards extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Big Orbit Cards',
            dataGetter: new DataGetter_BigOrbitCards(),
            dataProcessor: new DataProcesor_BigOrbitCards(),
        });
    }
}

class DataGetter_BigOrbitCards extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://www.bigorbitcards.co.uk/',
            searchPath: '?match=all&subcats=Y&pcode_from_q=N&pshort=N&pfull=N&pname=Y&pkeywords=N&search_performed=Y&product_variants=N&q=',
            searchSuffix: '&dispatch=products.search',
            searchJoin: '+',
        });
    }
}

class DataProcesor_BigOrbitCards extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: 'Big Orbit Cards',
            currencyCode: 'GBP',

            resultSelector: 'div > div.ty-pagination-container > div.ty-compact-list > div.ty-compact-list__item',
            titleSelector: 'form > div.compact_title_add_to_cart_header > bdi > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'form > div.ty-compact-list__content > div.ty-compact-list__controls.compact_list_add_to_cart > div > div > span > span:nth-child(2)',
            priceValueFromPriceText: (text): number => parseInt(text.replace(textStringFromInnerHtml, `$2$3`)),
            stockSelector: 'form > div.ty-compact-list__content > div.ty-compact-list__controls.compact_list_add_to_cart > div > div > span > span:nth-child(2)',
            stockValueFromStockText: (text): number => text === '[no such message]' ? 0 : parseInt(text.replace(/[\D]*([0-9]+)[\D]*£([0-9]+).([0-9]{2})[\D]*/, `$1`)),
            isFoilSelector: 'form > div.compact_title_add_to_cart_header > bdi > a',
            expansionSelector: 'form > div.compact_title_add_to_cart_header > span > span.ty-control-group__item',

            imgSelector: 'form > div.ty-compact-list__content > div.ty-compact-list__image > label > a > img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'form > div.ty-compact-list__content > div.ty-compact-list__image > label > a',
            productBaseUrl: '',
            productRefAttribute: 'href',
        });
    }
}

const textStringFromInnerHtml: RegExp = /(.|\n)*£([0-9]+).([0-9]{2})[\D]*/;

export default PriceGetter_BigOrbitCards;
