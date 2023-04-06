import AbstractDataGetter from './AbstractDataGetter';
import { AbstractDataProcessor } from './AbstractDataProcessor';
import { Price } from '../../../../types/Price';
import { writeFileSync } from 'fs';

// for use during development
// when true, raw HTML and processed results will be output to local directory (gitignored)
const saveOutPut: boolean = false;

interface Args {
    name: string,
    dataGetter: AbstractDataGetter,
    dataProcessor: AbstractDataProcessor,
}


class AbstractPriceGetter {

    name: string;
    dataGetter: AbstractDataGetter;
    dataProcessor: AbstractDataProcessor;

    constructor({ name, dataGetter, dataProcessor }: Args) {
        this.name = name;
        this.dataGetter = dataGetter;
        this.dataProcessor = dataProcessor;
    }

    search = async (searchTerm: string) : Promise<Price[]>  => {

        const sanitisedSearchTerm = removeDiacritics(searchTerm);

        const rawData: string = await this.dataGetter.getData(sanitisedSearchTerm);
                
        const foundItems: Price[] = await this.dataProcessor.processData(rawData);

        const validResults = foundItems
            .filter(result => strongMatch(result.title, sanitisedSearchTerm))
            .filter(result => excludeArtCard(result.title));


        // console.log(rawData);
        // console.log(validResults);
        
        if (saveOutPut) {
            const filePath: string = './src/services/pricesService/priceGetters/output/'
            saveToFile(`${filePath}${this.name}-${searchTerm}-html.txt`, rawData);
            saveToFile(`${filePath}${this.name}-${searchTerm}-prices.json`, JSON.stringify(validResults));
        }

        return validResults;
    }

}

// result filtering
const stripWord = (word: string): string => word.split('').filter(l => /\w/.test(l)).join('').toLowerCase();
const strongMatch = (title: string, searchTerm: string): boolean =>
    stripWord(removeDiacritics(title)).includes(stripWord(searchTerm));
const excludeArtCard = (title: string) => {
    const strippedTitle = stripWord(title);
    return !(strippedTitle.includes('artcard') || strippedTitle.includes('artseries') || title.includes('(Art)'));
}

// export const removeDiacritics = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
const removeDiacritics = (str: string) : string => str.normalize("NFD").replace(/\p{Diacritic}/gu, '');

const saveToFile = (filePath: string, contents: string) => {
    try {
        writeFileSync(filePath, contents);  
    } catch (e) {
        console.log(e);
    }
}

export default AbstractPriceGetter;
