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
    // Strongly recommended: always set this, even for non-lazy pages. When set, the scrape
    // service responds as soon as the element appears rather than waiting a fixed 3-second
    // timeout, which meaningfully reduces response time. Use a structural element that is
    // always present in the loaded page even when there are no results (e.g. a search results
    // wrapper div), not a result card (which would be absent on empty pages).
    // If null, the scraper falls back to a fixed 3-second wait.
    lazyElementSelector?: string | null;
}

abstract class AbstractScrapingDataGetter extends AbstractDataGetter {

    lazyElementSelector: string | null;
    // last reported scrapeMs per searchTerm — excludes time spent queued behind
    // MAX_CONCURRENT_BROWSERS other scrapes, see docs/browser-pool-design.md in mtg-ctm-scrape.
    #lastScrapeMs: { [searchTerm: string]: number } = {};

    constructor({ lazyElementSelector = null, ...rest }: ScrapingArgs) {
        super(rest);
        this.lazyElementSelector = lazyElementSelector;
        if (lazyElementSelector === null) {
            console.warn(`[AbstractScrapingDataGetter] No lazyElementSelector set for seller=[${rest.name}] — scrape service will fall back to a fixed 3-second wait. Set a selector for faster responses.`);
        }
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
            .catch((e) => {
                // clear any stale scrapeMs from a previous success for this searchTerm, so a
                // failed fetch doesn't get reported as taking however long the last success took.
                delete this.#lastScrapeMs[searchTerm];
                return this.handleDataError(searchTerm, e);
            });
    };

    // @Override — the scrape service reports { html, queueWaitMs, scrapeMs } rather than
    // raw HTML, since a request can sit queued behind other scrapes before it even starts.
    extractData = ({ data }: { data: any }, searchTerm: string): any => {
        console.log(`[${ts()}] [AbstractScrapingDataGetter.extractData] Extracting data for seller=[${this.name}] searchTerm=[${searchTerm}]`);
        if (typeof data?.scrapeMs === 'number') {
            this.#lastScrapeMs[searchTerm] = data.scrapeMs;
        }
        return data?.html ?? '';
    }

    getLastElapsedMs = (searchTerm: string): number | undefined => this.#lastScrapeMs[searchTerm];

    // Build the raw target URL without the CORS proxy prefix — the scrape service
    // fetches the page directly from a headless browser, so no proxy is needed.
    protected buildTargetUrl = (searchTerm: string): string =>
        this.baseUrl
        + this.searchPath
        + searchTerm.toLowerCase().split(' ').join(this.searchJoin)
        + this.searchSuffix;
}

export default AbstractScrapingDataGetter;
