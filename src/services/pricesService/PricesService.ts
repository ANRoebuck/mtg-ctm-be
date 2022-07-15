import AbstractPriceGetter from "./priceGetters/abstract/AbstractPriceGetter";
import configurePriceGetters from "./priceGetters/configurePriceGetters";
import { Price } from '../../types/Price';

class PricesService {

    priceGetters: { [key: string]: AbstractPriceGetter }

    constructor() {
        this.priceGetters = configurePriceGetters();
    }

    getSellers(): string[] {
        return Object.keys(this.priceGetters);
    }

    isValidSeller(seller: string): boolean {
        return Object.keys(this.priceGetters).includes(seller);
    }

    getPrices(seller: string, searchTerm: string): Promise<Price[]> | [] {
        console.log("getting prices. seller = " + seller + ", searchTerm = "  + searchTerm);
        const priceGetter: AbstractPriceGetter = this.priceGetters[seller];
        console.log("pricegetter = " + priceGetter.name);
        return priceGetter ? priceGetter.search(searchTerm) : [];
    }
}

// enforce singleton
const pricesService: PricesService = new PricesService();

export default pricesService;
