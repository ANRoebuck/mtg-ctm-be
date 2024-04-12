import AbstractDataGetter from './AbstractDataGetter';
import { AbstractDataProcessor } from './AbstractDataProcessor';
import { Price } from '../../../types/Price';
import { sanitizeString, saveToFile, strongMatch } from '../../../utils';

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

        const foundItems: Price[] = this.dataProcessor.processData(rawData);
        console.log(`Parsed ${foundItems.length} potential results`);

        const validResults = foundItems.filter(result => strongMatch(result.title, sanitisedSearchTerm));
        console.log(`Found ${validResults.length} valid results`);

        if (saveOutput) {
            // for use during development
            // when true, raw HTML and processed results will be output to local directory (gitignored)
            console.log('Saving output');
            const filePath: string = './src/services/pricesService/priceGetters/output/'
            // saveToFile(`${filePath}${this.name}_${searchTerm}_html.txt`, rawData);
            saveToFile(`${filePath}${this.name}_${searchTerm}_html.txt`, JSON.stringify(rawData));
            saveToFile(`${filePath}${this.name}_${searchTerm}_prices.json`, JSON.stringify(validResults));
        }

        return validResults;
    }

}

export default AbstractPriceGetter;
