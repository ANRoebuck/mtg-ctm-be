import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Unicorn Cards';
const baseUrl = 'https://unicorncards.co.uk';

// Unicorn Cards runs on NopCommerce. The search page returns a mix of TCG products;
// MTG singles are identified by " MTG Card" in the title.
// Title format: "{Card Name} {Rarity} [Foil] MTG Card :: {Expansion} ::"
// Stock: in-stock items have class "product-item", out-of-stock adds "product-item-out-of-stock".

class PriceGetter_UnicornCards extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Unicorn_Cards_logo_300x120.png',
            dataGetter: new DataGetter_UnicornCards(),
            dataProcessor: new DataProcessor_UnicornCards(),
        });
    }
}

class DataGetter_UnicornCards extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/`,
            searchPath: 'search?q=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_UnicornCards extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'div.product-item:not(.product-item-out-of-stock)',
            titleSelector: 'h2.product-title > a.product-title__link',
            titleFromText,

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'span.price.actual-price',
            priceValueFromPriceText: (x) => parseInt(x.replace(/[^0-9]/g, '')),

            stockSelector: '',
            stockValueFromStockText: () => 1,

            expansionSelector: 'h2.product-title > a.product-title__link',
            expansionFromText,

            isFoilSelector: '',

            imgSelector: 'div.picture img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: 'div.picture > a',
            productBaseUrl: baseUrl,
            productRefAttribute: 'href',
        });
    }
}

const titleFromText = (fullTitle: string): string => {
    const i = fullTitle.indexOf(' MTG Card');
    return i >= 0 ? fullTitle.slice(0, i).trim() : fullTitle;
};

const expansionFromText = (fullTitle: string): string => {
    const matches = [...fullTitle.matchAll(/:: ([^:]+) ::/g)];
    return matches.map(m => m[1].trim()).filter(s => s.length > 0).pop() || '';
};

export default PriceGetter_UnicornCards;
