import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../../types/Price';

interface TimeStampedPrices {
    timeStamp: number,
    prices: Price[],
}

interface CachedPricesMap {
    [searchTerm: string]: TimeStampedPrices,
}

class AbstractCachingPriceGetter {

    cachingAge: number;
    cachedPricesMap: CachedPricesMap = {};
    priceGetter: AbstractPriceGetter;

    constructor(cachingAge: number, priceGetter: AbstractPriceGetter){
        this.cachingAge = cachingAge;
        this.priceGetter = priceGetter;
    }

    search = (searchTerm: string): Promise<Price[]> => {

        if(this.hasCachedPrices(searchTerm)) {
            return this.getCachedPrices(searchTerm);
        }

        return this.getFreshPrices(searchTerm);
    }

    hasCachedPrices = (searchTerm: string): boolean => {
        // cachedPrices = this.cachedPricesMap[searchTerm];

        // if cachedPrices === undefined return false

        // if cachedPrices.timestamp is older than NOW minus this.cachingAge return false

        return true;
    }

    getCachedPrices = (searchTerm: string): Promise<Price[]> => {
        return Promise.resolve([]);
    }

    getFreshPrices = async (searchTerm: string): Promise<Price[]> => {
        const prices: Price[] = await this.priceGetter.search(searchTerm);
        this.cachePrices(searchTerm, prices);
        return prices;
    }

    cachePrices = (searchTerm: string, prices: Price[]): void => {
        const timeStamp: number = 0;
        this.cachedPricesMap[searchTerm] = {
            timeStamp,
            prices,
        }
    }



}

export default AbstractCachingPriceGetter;