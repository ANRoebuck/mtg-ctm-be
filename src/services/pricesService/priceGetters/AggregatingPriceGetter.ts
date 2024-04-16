import AbstractPriceGetter from "./AbstractPriceGetter";
import { Price } from '../../../types/Price';

interface Args {
    name: string,
    priceGetters: AbstractPriceGetter[]
}

class AggregatingPriceGetter {

    name: string;
    priceGetters: AbstractPriceGetter[];

    constructor({ name, priceGetters }: Args) {
        this.name = name;
        this.priceGetters = priceGetters;
    }

    search = async (searchTerm: string): Promise<Price[]> => {
        let aggregatedPrices: Price[] = [];

        this.priceGetters.forEach(async getter => (
            await getter.search(searchTerm)).forEach(p => aggregatedPrices.push(p)));

        return aggregatedPrices;
    }
}

export default AggregatingPriceGetter;