import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';
import axios from 'axios';
import { MTG_CTM_SCRAPE } from '../../../gateway/http';

const sellerName = 'Big Orbit Cards';

class PriceGetter_BigOrbitCards extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_BigOrbitCards(),
            dataProcessor: new DataProcesor_BigOrbitCards(),
        });
    }
}

class DataGetter_BigOrbitCards extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'http://www.bigorbitcards.co.uk/',
            searchPath: 'magic-the-gathering/search/',
            searchSuffix: '/',
            searchJoin: '+',
        });
    }

    // @Override
    getData = async (searchTerm: string): Promise<string> => axios
        .post(MTG_CTM_SCRAPE,
            {
                'targetUrl': this.searchTermToUrl(searchTerm),
                'lazyElementSelector': 'div.products > article.product-miniature',
            }
        )
        .then(this.extractData)
        .catch((e) => {
            console.log(`Failed to get data for seller=[${this.name}] searchTerm=[${searchTerm}]`);
            console.log(e);
            return '';
        });

    // @Override
    searchTermToUrl = (searchTerm: string) => {
        const url = this.baseUrl
            + this.searchPath
            + searchTerm.toLowerCase().split(' ').join(this.searchJoin)
            + this.searchSuffix;
        console.log('Requesting data from ' + url);
        return url;
    };
}

class DataProcesor_BigOrbitCards extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'div.products > article.product-miniature',
            titleSelector: 'div > div.right-block > div.product-desc > div.desc > h2',

            useSubResults: true,
            subresultSelector: 'div > div.right-block > div.product-desc > div.wrapper-buy > form.add-to-cart-or-refresh',
            subtitleSelector: 'div > span.product-row > span.product-name',
            subtitleFromText: (x: string): string => x,

            priceSelector: 'div > span.product-row > span.product-price',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),
            stockSelector: 'div > span.product-row > span.product-stock',
            stockValueFromStockText: (text) => parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
            isFoilSelector: '',
            expansionSelector: 'div > div.right-block > div > div.desc > p:nth-child(3)',

            imgSelector: 'div > div.thumbnail-wrapper > a > img.thumbnail-img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div > div.right-block > div.product-desc > div.desc > h2 > a',
            productBaseUrl: '',
            productRefAttribute: 'href',
        });
    }
}

// class DataProcesor_BigOrbitCards extends AbstractJsonDataProcessor {

//     constructor() {
//         super({
//             seller: sellerName,
//             currency: currencies.GBP,

//             processData: (rawData: any): Price[] => {
//                 const results: object[] = rawData.result || [];

//                 return results.map((result: any): Price => {
//                     const title: string = result.name.split('|')[0].replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, '$2');
//                     const imgSrc: string = result.image;
//                     const productRef: string = result.url;
//                     const expansion: string = result.magic_set;
//                     const price_minorUnits: number = parseInt(result.price.replace(/\D/g,''));
//                     const price_majorUnits = currencyService.minorUnitsToMajorUnits(price_minorUnits, this.currency);
//                     const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, this.currency);
//                     const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, this.currency);
//                     const stock_level = parseInt(result.inventory_level);
//                     const stock_inStock = stock_level > 0;
//                     const isFoil: boolean = title.toLowerCase().includes('foil');
//                     return {
//                         seller: this.seller,
//                         title,
//                         imgSrc,
//                         productRef,
//                         expansion,
//                         price_relativeUnits,
//                         price_textRepresentation,
//                         stock_inStock,
//                         stock_level: '' + stock_level,
//                         subtitle: '',
//                         isFoil };
//                 });
//             }
//         });
//     };

// }

export default PriceGetter_BigOrbitCards;
