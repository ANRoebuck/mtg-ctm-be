import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';
import axios from 'axios';
import { MTG_CTM_SCRAPE } from '../../../gateway/http';

// untap.cz is a Czech PrestaShop store. It serves a Cloudflare JS challenge to
// non-browser requests, so we use MTG_CTM_SCRAPE (headless Chrome) to fetch pages.
//
// Confirmed via robots.txt:
//   - Platform: PrestaShop
//   - Search URL: /search?search_query={term}
//
// NOTE: CSS selectors are based on standard PrestaShop 1.7 "classic" theme and
// will need to be verified against the live site once accessible.

const sellerName = 'Untap';

class PriceGetter_Untap extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'Europe',
            logoUrl: '/images/Untap_logo_300x120.png',
            dataGetter: new DataGetter_Untap(),
            dataProcessor: new DataProcessor_Untap(),
        });
    }
}

class DataGetter_Untap extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: 'https://untap.cz/',
            searchPath: 'search?search_query=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }

    // @Override — use headless browser scraper instead of direct HTTP (Cloudflare blocks bots)
    getData = async (searchTerm: string): Promise<string> => axios
        .post(MTG_CTM_SCRAPE,
            {
                'targetUrl': this.searchTermToUrl(searchTerm),
                'lazyElementSelector': 'article.product-miniature',
            }
        )
        .then(this.extractData)
        .catch((e) => {
            console.log(`Failed to get data for seller=[${this.name}] searchTerm=[${searchTerm}]`);
            console.log(e);
            return '';
        });

    // @Override — do not route through CORS proxy
    searchTermToUrl = (searchTerm: string) => {
        const url = this.baseUrl
            + this.searchPath
            + searchTerm.toLowerCase().split(' ').join(this.searchJoin)
            + this.searchSuffix;
        console.log('Requesting data from ' + url);
        return url;
    };
}

class DataProcessor_Untap extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.CZK,

            resultSelector: 'article.product-miniature',
            titleSelector: 'h3.product-title > a',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            priceSelector: 'span.price',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),
            stockSelector: '.product-availability',
            // "Nedostupné" = unavailable (Czech), otherwise treat as in-stock
            stockValueFromStockText: (text): number =>
                text.toLowerCase().includes('nedostup') ? 0 : (parseInt(text.replace(/\D/g, '')) || 1),
            isFoilSelector: 'h3.product-title > a',
            expansionSelector: '.product-description',

            imgSelector: '.thumbnail-container img',
            imgBaseUrl: '',
            imgSrcAttribute: 'src',

            productSelector: '.thumbnail-container > a',
            productBaseUrl: '',
            productRefAttribute: 'href',
        });
    }
}

export default PriceGetter_Untap;
