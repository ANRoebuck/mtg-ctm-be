import { IPriceGetterBehaviour } from './AbstractPriceGetter';
import { Price } from '../../../types/Price';

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
            const prices = await getter.getPrices(searchTerm, saveOutput);
            prices.forEach(p => aggregatedPrices.push(p));
        }));

        return aggregatedPrices;
    }
}

export default AggregatingPriceGetter;