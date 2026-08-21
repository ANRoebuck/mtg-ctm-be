import { Price, PriceResult } from '../types/Price';
import Seller from '../types/Seller';
import pricesService from '../services/pricesService/PricesService';


export const getPrices = async (seller: string, searchTerm: string, saveOutput: boolean): Promise<PriceResult[]> => {
    if (!searchTerm || !searchTerm.trim()) {
        return Promise.reject({ status: 400, message: 'searchTerm must not be empty' });
    }
    if (pricesService.isValidSeller(seller)) {
        return Promise.resolve(pricesService.getPrices(seller, searchTerm, saveOutput))
            .then(prices => prices.map(price => ({ ...price, searchTerm })));
    }
    return Promise.reject({ status:404, message: `Invalid seller: ${seller}` });
}

export const getSellers = (): Seller[] => {
    return pricesService.getSellers();
}

export const testAllModels = async (): Promise<object> => {
    return pricesService.testAllModels();
}
