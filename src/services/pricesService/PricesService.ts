import AbstractPriceGetter from "./priceGetters/abstract/AbstractPriceGetter";
import configurePriceGetters from "./priceGetters/configurePriceGetters";


class PricesService {

    priceGetters: { [key: string]: AbstractPriceGetter }

    constructor() {
        this.priceGetters = configurePriceGetters();
    }

    isValidSeller(seller: string) {
        return Object.keys(this.priceGetters).includes(seller);
    }

    getPrices(seller: string, searchTerm: string) {
        console.log("getting prices. seller = " + seller + ", searchTerm = "  + searchTerm);
        const priceGetter: AbstractPriceGetter = this.priceGetters[seller];
        console.log("pricegetter = " + priceGetter.name);
        return priceGetter ? priceGetter.search(searchTerm) : [];
    }
}

// enforce singleton
const pricesService: PricesService = new PricesService();

export default pricesService;
