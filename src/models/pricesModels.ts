import { Price } from '../types/Price';
import pricesService from "../services/pricesService/PricesService";

interface GetPricesRequest {
    seller: string,
    searchTerm: string,
}


const getPrices = async (getPricesRequest: GetPricesRequest): Promise<Price[]> => {
    return pricesService.getPrices(getPricesRequest.seller, getPricesRequest.searchTerm);
}

export default getPrices;
