import axios from 'axios';
import { MTG_CTM_SCRAPE } from '../../../gateway/http';
import { ts } from '../../../utils/Logger';
import AbstractDataGetter from './AbstractDataGetter';


interface ScrapingArgs {
    name: string;
    baseUrl: string;
    searchPath: string;
    searchSuffix: string;
    searchJoin: string;
    // CSS selector Playwright waits for before capturing the page HTML.
    // If null, the scraper falls back to a fixed 3-second wait.
    lazyElementSelector?: string | null;
}

abstract class AbstractScrapingDataGetter extends AbstractDataGetter {

    lazyElementSelector: string | null;

    constructor({ lazyElementSelector = null, ...rest }: ScrapingArgs) {
        super(rest);
        this.lazyElementSelector = lazyElementSelector;
    }

    // @Override — POST to headless-browser scrape service instead of direct HTTP GET
    getData = async (searchTerm: string): Promise<any> => {
        console.log(`[${ts()}] [AbstractScrapingDataGetter.getData] Using scrape service for seller=[${this.name}] searchTerm=[${searchTerm}] target=[${this.buildTargetUrl(searchTerm)}]`);
        return axios
            .post(MTG_CTM_SCRAPE, {
                targetUrl: this.buildTargetUrl(searchTerm),
                lazyElementSelector: this.lazyElementSelector,
            })
            .then((response) => this.extractData(response, searchTerm))
            .catch((e) => this.handleDataError(searchTerm, e));
    };

    // Build the raw target URL without the CORS proxy prefix — the scrape service
    // fetches the page directly from a headless browser, so no proxy is needed.
    protected buildTargetUrl = (searchTerm: string): string =>
        this.baseUrl
        + this.searchPath
        + searchTerm.toLowerCase().split(' ').join(this.searchJoin)
        + this.searchSuffix;
}

export default AbstractScrapingDataGetter;
