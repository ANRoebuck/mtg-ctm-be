import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_MagicMadhouse extends AbstractPriceGetter {
    constructor() {
        super({
            name: 'Magic Madhouse',
            dataGetter: new DataGetter_MagicMadhouse(),
            processorSelector: new ProcessorSelector_MagicMadhouse(),
        });
    }
}

class DataGetter_MagicMadhouse extends AbstractDataGetter {
    constructor() {
        super({
            baseUrl: 'https://eucs25.ksearchnet.com/',
            searchPath: 'cloud-search/n-search/search?ticket=klevu-161710301480613427&term=',
            searchSuffix: '&paginationStartsFrom=0&sortPrice=false&ipAddress=undefined&analyticsApiKey=klevu-161710301480613427&showOutOfStockProducts=true&klevuFetchPopularTerms=false&klevu_priceInterval=500&fetchMinMaxPrice=true&klevu_multiSelectFilters=true&noOfResults=36&klevuSort=rel&enableFilters=true&filterResults=&visibility=search&category=KLEVU_PRODUCT&klevu_filterLimit=400&sv=121&lsqt=&responseType=json&priceFieldSuffix=GBP&klevu_loginCustomerGroup=',
            searchJoin: '%20',
        });
    }
}

class ProcessorSelector_MagicMadhouse extends AbstractProcessorSelector {
    constructor() {
        super([new DataProcessor_MagicMadhouse()]);
    }
}

class DataProcessor_MagicMadhouse extends AbstractDataProcessor {
    constructor() {
        super({
            seller: 'Magic Madhouse',

            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g,'')),

            expansionSelector: "",
            imgBaseUrl: "",
            imgSelector: "",
            imgSrcAttribute: "",
            isFoilSelector: "",
            priceSelector: "",
            productBaseUrl: "",
            productRefAttribute: "",
            productSelector: "",
            resultSelector: "",
            stockSelector: "",
            stockValueFromStockText(x: string): number {return 0;},
            subresultSelector: "",
            subtitleFromText(x: string): string {return "";},
            subtitleSelector: "",
            titleSelector: "",
            useSubResults: false,
        });
    }

    // @Override
    dataToResultsArray = (data) => data.result || [];

    // @Override
    titleFromResultNode = (resultNode) => resultNode.name.split('|')[0].replace(regex.whiteSpaceStripper, '$2');

    // @Override
    isFoilFromResultNode = (resultNode) => this.isFoilFromTitle(this.titleFromResultNode(resultNode));

    // @Override
    priceFromResultNode = ({ price }: { price: string}): number => this.priceValueFromPriceText(price);

    // @Override
    stockFromResultNode = ({ inventory_level }) => {
        const value = parseInt(inventory_level);
        return {
            value,
            text: value > 0 ? value + ' in Stock' : 'Out of Stock',
        };
    };

    // @Override
    imgSrcFromResultNode = (resultNode) => resultNode.image;

    // @Override
    productRefFromResultNode = (resultNode) => resultNode.url;

    // @Override
    expansionFromResultNode = (resultNode) => resultNode.magic_set;

    // Override
    subtitleFromResultNode = (resultNode) => '';
}

export default PriceGetter_MagicMadhouse;
