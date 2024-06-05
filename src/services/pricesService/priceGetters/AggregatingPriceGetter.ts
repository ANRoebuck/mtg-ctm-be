import { IPriceGetterBehaviour } from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { saveToFile } from '../../../utils/utils';

interface Args {
    name: string,
    priceGetters: IPriceGetterBehaviour[]
}

class AggregatingPriceGetter {

    name: string;
    priceGetters: IPriceGetterBehaviour[];

    constructor({ name, priceGetters }: Args) {
        this.name = name;
        this.priceGetters = priceGetters;
    }

    getPrices = async (searchTerm: string, saveOutput: boolean = false): Promise<Price[]> => {
        let aggregatedPrices: Price[] = [];
        
        await Promise.all(this.priceGetters.map(async getter => {
            const prices = await getter.getPrices(searchTerm, false);
            prices.forEach(p => aggregatedPrices.push(p));
        }));

        if (saveOutput) {
            // for use during development
            // when true, raw HTML and processed results will be output to local directory (gitignored)
            console.log('Saving output');
            const filePath: string = './src/services/pricesService/priceGetters/output/'
            saveToFile(`${filePath}${this.name}_${searchTerm}_prices.json`, JSON.stringify(aggregatedPrices));
        }

        return aggregatedPrices;
    }
}

export default AggregatingPriceGetter;