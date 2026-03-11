import { IPriceGetterBehaviour } from "./priceGetters/AbstractPriceGetter";

type SellerTestResult = {
    status: 'ok' | 'no results';
    resultCount: number;
    searchTerm: string;
}
import configurePriceGetters from "./priceGetters/configurePriceGetters";
import { Price } from '../../types/Price';
import Seller from '../../types/Seller';

class PricesService {

    priceGetters: { [key: string]: IPriceGetterBehaviour }

    constructor() {
        this.priceGetters = configurePriceGetters();
    }

    getSellers(): Seller[] {
        return Object.values(this.priceGetters).map(({ name, region, logoUrl }) => ({ name, region, logoUrl }));
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

    async testAllModels(): Promise<{ [sellerName: string]: SellerTestResult }> {
        const searchTerms = ['Steam Vents', 'Glen Elendra Guardian', 'Lightning Bolt', 'Counterspell'];

        const entries = await Promise.all(
            Object.entries(this.priceGetters).map(async ([sellerName, priceGetter]) => {
                for (const searchTerm of searchTerms) {
                    const prices = await priceGetter.getPrices(searchTerm);
                    if (prices.length > 0) {
                        return [sellerName, { status: 'ok', resultCount: prices.length, searchTerm }];
                    }
                }
                return [sellerName, { status: 'no results', resultCount: 0, searchTerm: searchTerms[searchTerms.length - 1] }];
            })
        );

        return Object.fromEntries(entries);
    }
}

// enforce singleton
const pricesService: PricesService = new PricesService();

export default pricesService;
