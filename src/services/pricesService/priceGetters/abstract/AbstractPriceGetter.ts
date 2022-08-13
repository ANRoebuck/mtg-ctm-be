import AbstractDataGetter from './AbstractDataGetter';
import { AbstractDataProcessor } from './AbstractDataProcessor';
import { Price } from '../../../../types/Price';

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
            .filter(result => excludeArtCard(result.title))
            .filter(result => result.stock_inStock);

        // console.log(rawData);
        // console.log(validResults);

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

export default AbstractPriceGetter;
