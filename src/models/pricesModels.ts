import { Price } from '../types/Price';
import pricesService from "../services/pricesService/PricesService";


const getPrices = async (seller: string, searchTerm: string): Promise<Price[]> => {
    if (pricesService.isValidSeller(seller)) {
        return pricesService.getPrices(seller, searchTerm);
    }
    return Promise.reject({ status:404, message: `Invalid seller: ${seller}` });
}

export default getPrices;
