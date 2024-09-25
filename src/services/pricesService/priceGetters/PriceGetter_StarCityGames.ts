import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';
import axios from 'axios';
import { Price } from '../../../types/Price';

const sellerName = 'Star City Games';

class PriceGetter_StarCityGames extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            dataGetter: new DataGetter_StarCityGames_New(),
            dataProcessor: new DataProcessor_StarCityGames_New(),
        });
    }
}


class DataGetter_StarCityGames_New extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'https://essearchapi-na.hawksearch.com/api/v2/search',
            searchPath: '',
            searchSuffix: '',
            searchJoin: '',
        });
    }

    // @Override
    getData = async (searchTerm: string): Promise<string> => axios
        .post(this.baseUrl,
            {
                'Keyword': searchTerm,
                'Variant': { 'Origin': 'compare-the-magic' },
                'SortBy': 'score',
                'FacetSelections': { 'variant_instockonly': ['Yes'] },
                'MaxPerPage': 24,
                'clientguid': 'cc3be22005ef47d3969c3de28f09571b'
            }
        )
        .then(this.extractData)
        .catch((_) => {
            console.log('Failed to get data');
            // console.log(e);
            return '';
        });

}

class DataProcessor_StarCityGames_New extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.USD,

            processData: (someJson: any): Price[] => {
                return someJson.Results
                    .filter(({ Document: { card_name } }: any) => card_name)      // ignore non-card results like playmats
                    .map((r: any): Price => {

                        const {
                            card_name,
                            primary_category_name,
                            image,
                            url_detail,
                            price_retail,
                            metric_inventory,
                            subtitle: sub,
                            finish,
                            // hawk_child_attributes: {
                            //     0: {
                            //         price,
                            //     }
                            // }
                        } = r.Document;

                        // values are wrapped in single-element arrays
                        const [title] = card_name;

                        const [imgSrc] = image;

                        const [urlPath] = url_detail;
                        const productRef = `https://starcitygames.com${urlPath}`

                        const [expansion] = primary_category_name;

                        const [price_text] = price_retail;
                        const price_relativeUnits = parseInt(price_text.replace(/\D/g,''));
                        const price_textRepresentation = `${this.currency.representation} ${price_text}`;

                        const [stock_level] = metric_inventory;

                        const [subtitle] = sub || [''];

                        const [foil] = finish;
                        const isFoil =  foil === 'Foil';

                        return {
                            seller: this.seller,
                            title,
                            imgSrc,
                            productRef,
                            expansion,
                            price_relativeUnits,
                            price_textRepresentation,
                            stock_inStock: true,
                            stock_level,
                            subtitle,
                            isFoil,
                        };
                    });
            }
        });
    }
}


// class DataGetter_StarCityGames_Old extends AbstractDataGetter {
//     constructor() {
//         super({
//             baseUrl: 'https://starcitygames.hawksearch.com/',
//             searchPath: 'sites/starcitygames/?search_query=',
//             searchSuffix: '&ajax=1&json=1&hawkcustom=undefined&hawkvisitorid=foo&callback=jQuery3410974876865918253_1633569817522&_=1633569817523',
//             searchJoin: '%20',
//         });
//     }

//     // @Override
//     extractData = ({ data }: { data: string }): string => {
//         // use [\s\S] instead of . to include matching new line char
//         let str = data.replace(/.*\((\{[\s\S]*\})\)/g, `$1`);
//         // console.log(typeof  str);
//         // console.log(str.split('').slice(0,50));
//         // console.log(str);

//         // local tests do not work but the model works live
//         // suspected issue with json parsing

//         let o;
//         try {
//             o = JSON.parse(str);
//         } catch (e) {
//             console.log(e);
//         }
//         // console.log(o);

//         return o.html;
//     };
// }

// class DataProcessor_StarCityGames_Old extends AbstractHtmlDataProcessor {
//     constructor() {
//         super({
//             seller: sellerName,
//             currency: currencies.USD,

//             resultSelector: 'div > div.hawk-results-item',
//             titleSelector: 'div > div > h2 > a',

//             useSubResults: true,
//             subresultSelector: 'div > div > div > div > div.hawk-results-item__options-table-row',
//             subtitleSelector: 'div.hawk-results-item__options-table-cell.hawk-results-item__options-table-cell--name',
//             subtitleFromText: removeTags,

//             priceSelector: 'div.hawk-results-item__options-table-cell.hawk-results-item__options-table-cell--price',
//             priceValueFromPriceText: (text: string): number => parseInt((removeTags(text)).replace(/\D/g, '')),
//             stockSelector: 'div.hawk-results-item__options-table-cell.hawk-results-item__options-table-cell--qty',
//             stockValueFromStockText: (text: string): number => text === 'Out of stock.' ? 0 : parseInt(text.replace(/([0-9]*)([^0-9]*)/, `$1`)),
//             isFoilSelector: 'div > div > p > a',
//             expansionSelector: 'div > div > p > a',

//             imgSelector: 'div > div > div > a > img',
//             imgBaseUrl: '',
//             imgSrcAttribute: 'src',

//             productSelector: 'div > div > h2 > a',
//             productBaseUrl: 'https://starcitygames.com',
//             productRefAttribute: 'href',
//         });
//     }
// }

// const removeTags = (text: string): string => text.replace(/<.*?>/g, '');

export default PriceGetter_StarCityGames;
