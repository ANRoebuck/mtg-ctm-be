import { IPriceGetterBehaviour } from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { HOURS, MINUTES } from '../../../utils/time';

const DEFAULT_CACHING_AGE: number = 1 * HOURS + 30 * MINUTES;

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
    #priceGetter: IPriceGetterBehaviour;

    constructor(cachingAge: number = DEFAULT_CACHING_AGE, priceGetter: IPriceGetterBehaviour){
        this.#cachingAge = cachingAge;
        this.#priceGetter = priceGetter;
    }

    search = async (searchTerm: string): Promise<Price[]> => {
        this.#invalidateStalePrices();

        if(this.#hasCachedPrices(searchTerm)) {
            return this.#getCachedPrices(searchTerm);
        }

        return this.#getFreshPrices(searchTerm);
    }

    #hasCachedPrices = (searchTerm: string): boolean => {
        const cachedPrices = this.#cachedPricesMap[searchTerm];
        return Boolean(cachedPrices);
    }

    #cachedPricesInDate = (searchTerm: string): boolean => {
        return this.#cachedPricesMap[searchTerm].timeStamp > (Date.now() - this.#cachingAge);
    }

    #getCachedPrices = (searchTerm: string): Price[] => {
        console.log(`returning cached prices for ${searchTerm}`);
        return this.#cachedPricesMap[searchTerm].prices;
    }

    #getFreshPrices = async (searchTerm: string): Promise<Price[]> => {
        const prices: Price[] = await this.#priceGetter.getPrices(searchTerm);
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

    #invalidateStalePrices = (): void => {
        Object.keys(this.#cachedPricesMap).forEach((k) => {
            if (!this.#cachedPricesInDate(k)) {
                delete this.#cachedPricesMap[k];
            }
        });
    }

}

export default CachingPriceGetter;