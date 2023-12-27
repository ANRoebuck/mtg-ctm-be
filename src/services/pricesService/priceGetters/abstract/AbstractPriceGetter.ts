import AbstractDataGetter from './AbstractDataGetter';
import { AbstractDataProcessor } from './AbstractDataProcessor';
import { Price } from '../../../../types/Price';
import { writeFileSync } from 'fs';
import { saveToFile } from '../spec/test-resources/_fsUtils';

interface Args {
    name: string,
    dataGetter: AbstractDataGetter,
    dataProcessor: AbstractDataProcessor,
}


abstract class AbstractPriceGetter {

    name: string;
    dataGetter: AbstractDataGetter;
    dataProcessor: AbstractDataProcessor;

    constructor({ name, dataGetter, dataProcessor }: Args) {
        this.name = name;
        this.dataGetter = dataGetter;
        this.dataProcessor = dataProcessor;
    }

    search = async (searchTerm: string, saveOutput: boolean = false): Promise<Price[]> => {

        const sanitisedSearchTerm = sanitizeString(searchTerm);

        const rawData: string = await this.dataGetter.getData(sanitisedSearchTerm);

        const foundItems: Price[] = await this.dataProcessor.processData(rawData);

        const validResults = foundItems.filter(result => strongMatch(result.title, sanitisedSearchTerm));

        // console.log(rawData);
        // console.log(validResults);

        if (saveOutput) {
            // for use during development
            // when true, raw HTML and processed results will be output to local directory (gitignored)
            console.log('Saving output');
            const filePath: string = './src/services/pricesService/priceGetters/output/'
            saveToFile(`${filePath}${this.name}-${searchTerm}-html.txt`, JSON.stringify(rawData));
            saveToFile(`${filePath}${this.name}-${searchTerm}-prices.json`, JSON.stringify(validResults));
        }

        return validResults;
    }

}

// result filtering

const defaultBannedTerms = ['artcard', 'artseries', '(Art)'];

const sanitizeString = (text: string) => text.toLowerCase().replace(/\n/g, '').normalize("NFD").replace(/\p{Diacritic}/gu, '');

export const strongMatch = (textBody: string, searchTerm: string, bannedTerms: string[] = defaultBannedTerms) => {
    // Ignore case, new lines, special chars and diacritics
    const sanitizedTextBody = sanitizeString(textBody);

    // Check for banned terms
    if (bannedTerms.some(term => sanitizedTextBody.includes(sanitizeString(term)))) {
        return false;
    }

    // Ignore case, new lines, special chars and diacritics
    const sanitizedSearchTerm = sanitizeString(searchTerm);

    // Use a regular expression for strong matching
    const regex = new RegExp(`\\b${sanitizedSearchTerm}\\b`, 'g');

    return regex.test(sanitizedTextBody);
}

export default AbstractPriceGetter;
