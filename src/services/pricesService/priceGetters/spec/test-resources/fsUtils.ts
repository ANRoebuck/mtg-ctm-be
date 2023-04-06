import { readFileSync } from 'fs';
import { Price } from '../../../../../types/Price';


export const readHtmlString = (sellerName: string, searchTerm: string): string => {
    let htmlString: string = '';
    try {
        const file = `./src/services/pricesService/priceGetters/spec/test-resources/${sellerName}-${searchTerm}-html.txt`;
        htmlString = readFileSync(file, 'utf8');
    } catch(e) {
        console.log(e);
    }
    return htmlString;
}

export const readResults = (sellerName: string, searchTerm: string): Price[] => {
    let results: Price[] = [];
    try {
        const file = `./src/services/pricesService/priceGetters/spec/test-resources/${sellerName}-${searchTerm}-prices.json`;
        results = JSON.parse(readFileSync(file, 'utf8'));
    } catch(e) {
        console.log(e);
    }
    return results;
}