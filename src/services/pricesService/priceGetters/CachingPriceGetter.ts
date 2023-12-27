import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';

interface TimeStampedPrices {
    timeStamp: number,
    prices: Price[],
}

interface CachedPricesMap {
    [searchTerm: string]: TimeStampedPrices,
}

class CachingPriceGetter {

    #cachingAge: number;
    #cachedPricesMap: CachedPricesMap = {};
    #priceGetter: AbstractPriceGetter;

    constructor(cachingAge: number, priceGetter: AbstractPriceGetter){
        this.#cachingAge = cachingAge;
        this.#priceGetter = priceGetter;
    }

    search = async (searchTerm: string): Promise<Price[]> => {

        if(this.#hasCachedPrices(searchTerm)) {
            return this.#getCachedPrices(searchTerm);
        }

        return this.#getFreshPrices(searchTerm);
    }

    #hasCachedPrices = (searchTerm: string): boolean => {
        const cachedPrices = this.#cachedPricesMap[searchTerm];
        if(!cachedPrices) {
            return false;
        }

        const cachedPricesInDate = cachedPrices.timeStamp > (Date.now() - this.#cachingAge);
        if(!cachedPricesInDate) {
            this.#invalidatePrices(searchTerm);
            return false;
        }

        return true;
    }

    #getCachedPrices = (searchTerm: string): Price[] => {
        return this.#cachedPricesMap[searchTerm].prices;
    }

    #getFreshPrices = async (searchTerm: string): Promise<Price[]> => {
        const prices: Price[] = await this.#priceGetter.search(searchTerm);
        this.#cachePrices(searchTerm, prices);
        return prices;
    }

    #cachePrices = (searchTerm: string, prices: Price[]): void => {
        const timeStamp: number = Date.now();
        this.#cachedPricesMap[searchTerm] = {
            timeStamp,
            prices,
        }
    }

    #invalidatePrices = (searchTerm: string) => {
        // this.cachedPricesMap.delete(searchTerm);
    }

}

export default CachingPriceGetter;