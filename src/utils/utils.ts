import { readFileSync, writeFileSync } from 'fs';
import { Price } from '../types/Price';

export const sanitizeString = (text: string) => text.toLowerCase().replace(/[\n'-]/g, '').normalize("NFD").replace(/\p{Diacritic}/gu, '');

const defaultBannedTerms = ['artcard', 'artseries', '(Art)'];

export const strongMatch = (textBody: string, searchTerm: string, bannedTerms: string[] = defaultBannedTerms) => {

    // Ignore case, new lines, special chars and diacritics
    const sanitizedTextBody = sanitizeString(textBody);
    console.log('Text body = ' + sanitizedTextBody);

    // Check for banned terms
    if (bannedTerms.some(term => sanitizedTextBody.includes(term.toLocaleLowerCase()))) {
        return false;
    }

    // Ignore case, new lines, special chars and diacritics
    const sanitizedSearchTerm = sanitizeString(searchTerm);
    console.log(sanitizedSearchTerm);

    // Use a regular expression for strong matching
    const regex = new RegExp(`\\b${sanitizedSearchTerm}\\b`, 'g');

    return regex.test(sanitizedTextBody);
}

export const saveToFile = (filePath: string, contents: string) => {
    try {
        writeFileSync(filePath, contents);
    } catch (e) {
        console.log(e);
    }
}

export const readHtmlString = (sellerName: string, searchTerm: string, suffix: string = ''): string => {
    let htmlString: string = '';
    try {
        const file = `./src/services/pricesService/priceGetters/spec/test-resources/${sellerName}_${searchTerm}${suffix}_html.txt`;
        htmlString = readFileSync(file, 'utf8');
    } catch(e) {
        console.log(e);
    }
    return htmlString;
}

export const readResults = (sellerName: string, searchTerm: string, suffix: string = ''): Price[] => {
    let results: Price[] = [];
    try {
        const file = `./src/services/pricesService/priceGetters/spec/test-resources/${sellerName}_${searchTerm}${suffix}_prices.json`;
        results = JSON.parse(readFileSync(file, 'utf8'));
    } catch(e) {
        console.log(e);
    }
    return results;
}