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

    getPrices = async (searchTerm: string): Promise<Price[]> => {
        let aggregatedPrices: Price[] = [];

        this.priceGetters.forEach(async getter => (
            await getter.getPrices(searchTerm)).forEach(p => aggregatedPrices.push(p)));

        return aggregatedPrices;
    }
}

export default AggregatingPriceGetter;