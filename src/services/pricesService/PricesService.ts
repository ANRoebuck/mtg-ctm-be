import { IPriceGetterBehaviour } from "./priceGetters/AbstractPriceGetter";
import configurePriceGetters from "./priceGetters/configurePriceGetters";
import { Price } from '../../types/Price';

class PricesService {

    priceGetters: { [key: string]: IPriceGetterBehaviour }

    constructor() {
        this.priceGetters = configurePriceGetters();
    }

    getSellers(): string[] {
        return Object.keys(this.priceGetters);
    }

    isValidSeller(seller: string): boolean {
        // console.log("Checking seller: " + seller);
        // console.log(Object.keys(this.priceGetters));
        return Object.keys(this.priceGetters).includes(seller);
    }

    getPrices(seller: string, searchTerm: string, saveOutput: boolean): Promise<Price[]> | [] {
        console.log(`Getting prices. seller=[${seller}] , searchTerm=[${searchTerm}] , saveOutput=[${saveOutput}]`);
        const priceGetter: IPriceGetterBehaviour = this.priceGetters[seller];
        console.log(`Pricegetter=[${priceGetter.name}]`);
        return priceGetter ? priceGetter.getPrices(searchTerm, saveOutput) : [];
    }
}

// enforce singleton
const pricesService: PricesService = new PricesService();

export default pricesService;
