import { Price } from '../types/Price';
import pricesService from '../services/pricesService/PricesService';


export const getPrices = async (seller: string, searchTerm: string, saveOutput: boolean): Promise<Price[]> => {
    if (pricesService.isValidSeller(seller)) {
        return pricesService.getPrices(seller, searchTerm, saveOutput);
    }
    return Promise.reject({ status:404, message: `Invalid seller: ${seller}` });
}

export const getSellers = (): string[] => {
    return pricesService.getSellers();
}

export const testAllModels = async (): Promise<object> => {
    return pricesService.testAllModels();
}
