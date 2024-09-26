import { Price } from "../../../../types/Price";
import { IPriceGetterBehaviour } from "../AbstractPriceGetter";
import CachingPriceGetter from "../CachingPriceGetter";
import PriceGetter_Axion from '../PriceGetter_Axion';
import { SECONDS } from "../../../../utils/time";





const mockSearch = jest.fn();
jest.mock('../PriceGetter_Axion', () => {
    return jest.fn().mockImplementation(() => {
        return { getPrices: mockSearch }
    })
});

let mockPriceGetter: IPriceGetterBehaviour;
let cachingPriceGetter: CachingPriceGetter;



describe('CachingPriceGetter', () => {

    beforeAll(() => jest.useFakeTimers());

    beforeEach(() => {
        mockPriceGetter = new PriceGetter_Axion();
    
        cachingPriceGetter =
            new CachingPriceGetter(
                (2 * SECONDS),
                mockPriceGetter
            );
    
        mockSearch
            .mockReset()
            .mockReturnValueOnce(somePrices)
            .mockReturnValueOnce(morePrices)
            .mockReturnValueOnce(evenMorePrices);
    });
    
    afterAll(() => jest.useRealTimers());

    it('Requests results from PriceGetter', async () => {
        const prices = await (cachingPriceGetter.search('foo'));

        expect(mockPriceGetter.getPrices).toHaveBeenCalledWith('foo');
        expect(prices).toBe(somePrices);
    });

    it('Returns cached results if requested again within age limit', async () => {
        const firstPrices = await (cachingPriceGetter.search('foo'));
        // call again immediately
        const secondPrices = await (cachingPriceGetter.search('foo'));

        expect(mockPriceGetter.getPrices).toHaveBeenCalledTimes(1);
        expect(firstPrices).toBe(somePrices);
        expect(secondPrices).toBe(somePrices);
    });

    it('Requests results a second time if requested after age limit expires', async () => {
        const firstPrices = await (cachingPriceGetter.search('foo'));

        jest.advanceTimersByTime(2 * SECONDS);

        const secondPrices = await (cachingPriceGetter.search('foo'));

        expect(mockPriceGetter.getPrices).toHaveBeenCalledTimes(2);
        expect(firstPrices).toBe(somePrices);
        expect(secondPrices).toBe(morePrices);
    });

    // it('Invalidates old prices on new search', () => {

    // to test this will require exposing the cachedPricesMap

    // });

});

const somePrices: Price[] = [
    {
        seller: 'aaa',
        title: 'aaa',
        imgSrc: 'aaa',
        productRef: 'aaa',
        expansion: 'aaa',
        price_relativeUnits: 0,
        price_textRepresentation: 'aaa',
        stock_inStock: true,
        stock_level: 'aaa',
        subtitle: 'aaa',
        isFoil: true,
    },
    {
        seller: 'bbb',
        title: 'bbb',
        imgSrc: 'bbb',
        productRef: 'bbb',
        expansion: 'bbb',
        price_relativeUnits: 0,
        price_textRepresentation: 'bbb',
        stock_inStock: true,
        stock_level: 'bbb',
        subtitle: 'bbb',
        isFoil: true,
    },
];

const morePrices: Price[] = [
    {
        seller: 'ccc',
        title: 'ccc',
        imgSrc: 'ccc',
        productRef: 'ccc',
        expansion: 'ccc',
        price_relativeUnits: 0,
        price_textRepresentation: 'ccc',
        stock_inStock: true,
        stock_level: 'ccc',
        subtitle: 'ccc',
        isFoil: true,
    }
];

const evenMorePrices: Price[] = [
    {
        seller: 'ddd',
        title: 'ddd',
        imgSrc: 'ddd',
        productRef: 'ddd',
        expansion: 'ddd',
        price_relativeUnits: 0,
        price_textRepresentation: 'ddd',
        stock_inStock: true,
        stock_level: 'ddd',
        subtitle: 'ddd',
        isFoil: true,
    }
];