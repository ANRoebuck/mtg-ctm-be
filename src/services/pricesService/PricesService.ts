import AbstractPriceGetter from "./priceGetters/AbstractPriceGetter";
import configurePriceGetters from "./priceGetters/configurePriceGetters";


class PricesService {

    priceGetters: { [key: string]: AbstractPriceGetter }

    constructor() {
        this.priceGetters = configurePriceGetters();
    }

    getPrices(seller: string, searchTerm: string) {
        const priceGetter: AbstractPriceGetter = this.priceGetters[seller];
        return priceGetter ? priceGetter.search(searchTerm) : [];
    }
}

// enforce singleton
const pricesService: PricesService = new PricesService();

export default pricesService;
