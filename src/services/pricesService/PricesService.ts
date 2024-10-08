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
        if (!priceGetter) console.log(`Could not find priceGetter for seller=[${seller}]`);
        
        return priceGetter ? priceGetter.getPrices(searchTerm, saveOutput) : [];
    }

    testAllModels(): object {
        return Promise.all(
            Object.entries(this.priceGetters)
                .map(async ([sellerName, priceGetter]) => {
                    const prices = await priceGetter
                        .getPrices('counterspell')
                        .then(prices => [sellerName, prices.length]);
                    return prices;
                }))
                .then(Object.fromEntries);
    }
}

// enforce singleton
const pricesService: PricesService = new PricesService();

export default pricesService;
