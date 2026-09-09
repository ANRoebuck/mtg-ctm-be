import AbstractDataGetter from './AbstractDataGetter';
import { ts } from '../../../utils/Logger';
import { AbstractDataProcessor } from './AbstractDataProcessor';
import { Price } from '../../../types/Price';
import Region from '../../../types/Region';
import { sanitizeString, saveToFile, strongMatch } from '../../../utils/utils';

type Args = {
    name: string,
    region: Region,
    logoUrl: string,
    dataGetter: AbstractDataGetter,
    dataProcessor: AbstractDataProcessor,
}

export interface IPriceGetterBehaviour {
    name: string;
    region: Region;
    logoUrl: string;
    getPrices(searchTerm: string, saveOutput?: boolean): Promise<Price[]>;
    // reports how long the underlying fetch actually took, even when getPrices() itself
    // was served from a cache and returned near-instantly. Implemented by CachingPriceGetter.
    getLastElapsedMs?(searchTerm: string): number | undefined;
}


abstract class AbstractPriceGetter implements IPriceGetterBehaviour {

    name: string;
    region: Region;
    logoUrl: string;
    dataGetter: AbstractDataGetter;
    dataProcessor: AbstractDataProcessor;
    #lastElapsedMs: { [searchTerm: string]: number } = {};

    constructor({ name, region, logoUrl, dataGetter, dataProcessor }: Args) {
        this.name = name;
        this.region = region;
        this.logoUrl = logoUrl;
        this.dataGetter = dataGetter;
        this.dataProcessor = dataProcessor;
    }

    getPrices = async (searchTerm: string, saveOutput: boolean = false): Promise<Price[]> => {

        const sanitisedSearchTerm = sanitizeString(searchTerm);

        const start = Date.now();
        const rawData = await this.dataGetter.getData(sanitisedSearchTerm);
        // prefer the dataGetter's own reported duration when it has one — e.g. a scraping
        // getter can report time actually spent scraping, excluding any time this request
        // spent queued behind other scrapes. Falls back to wall-clock timing otherwise.
        const elapsed = this.dataGetter.getLastElapsedMs?.(sanitisedSearchTerm) ?? (Date.now() - start);
        this.#lastElapsedMs[searchTerm] = elapsed;

        const foundItems: Price[] = this.dataProcessor.processData(rawData);
        // console.log(`Parsed ${foundItems.length} potential results`);

        const validResults = foundItems.filter(result => strongMatch(result.title, sanitisedSearchTerm));
        // console.log(`Found ${validResults.length} valid results`);

        if (saveOutput) {
            // for use during development
            // when true, raw data and processed results will be output to local directory (gitignored)
            console.log(`[${ts()}] [AbstractPriceGetter.getPrices] Saving output`);
            const filePath: string = './src/services/pricesService/priceGetters/output/'
            saveToFile(`${filePath}${this.name}_${searchTerm}_raw.txt`, this.dataProcessor.serializeRawData(rawData));
            saveToFile(`${filePath}${this.name}_${searchTerm}_prices.json`, JSON.stringify(validResults));
        }

        console.log(`[${ts()}] [AbstractPriceGetter.getPrices] Returning ${validResults.length} results for searchTerm=[${searchTerm}] from seller=[${this.name}] in ${elapsed}ms`);
        return validResults;
    }

    getLastElapsedMs = (searchTerm: string): number | undefined => this.#lastElapsedMs[searchTerm];

}

export default AbstractPriceGetter;
