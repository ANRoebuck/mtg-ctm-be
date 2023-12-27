import { Price } from "../../../../types/Price";
import AbstractPriceGetter from "../AbstractPriceGetter";
import CachingPriceGetter from "../CachingPriceGetter";
import PriceGetter_Axion from '../PriceGetter_Axion';


jest.useFakeTimers();


const mockSearch = jest.fn();
jest.mock('../PriceGetter_Axion', () => {
    return jest.fn().mockImplementation(() => {
        return { search: mockSearch }
    })
})

let mockPriceGetter: AbstractPriceGetter;

beforeEach(() => {
    mockSearch.mockReset();
    mockPriceGetter = new PriceGetter_Axion();
});

afterAll(() => jest.useRealTimers());

describe.only('CachingPriceGetter', () => {
    it('Requests results from PriceGetter', async () => {
        const cachingPriceGetter = new CachingPriceGetter(0, mockPriceGetter);
        mockSearch.mockReturnValueOnce(somePrices).mockReturnValueOnce(morePrices);

        const prices = await(cachingPriceGetter.search('foo'));

        expect(mockPriceGetter.search).toHaveBeenCalledWith('foo');
        expect(prices).toBe(somePrices);
    });

    it('Returns cached results if requested again within age limit', async () => {
        const cachingPriceGetter = new CachingPriceGetter(1000, mockPriceGetter);
        mockSearch.mockReturnValueOnce(somePrices).mockReturnValueOnce(morePrices);

        const firstPrices = await(cachingPriceGetter.search('foo'));
        // call again immediately
        const secondPrices = await(cachingPriceGetter.search('foo'));

        expect(mockPriceGetter.search).toHaveBeenCalledTimes(1);
        expect(firstPrices).toBe(somePrices);
        expect(secondPrices).toBe(somePrices);
    });

    it('Requests results a second time if requested after age limit expires', async () => {
        const cachingPriceGetter = new CachingPriceGetter(1000, mockPriceGetter);
        mockSearch.mockReturnValueOnce(somePrices).mockReturnValueOnce(morePrices);

        const firstPrices = await(cachingPriceGetter.search('foo'));
        jest.advanceTimersByTime(2000);
        const secondPrices = await(cachingPriceGetter.search('foo'));

        expect(mockPriceGetter.search).toHaveBeenCalledTimes(2);
        expect(firstPrices).toBe(somePrices);
        expect(secondPrices).toBe(morePrices);
    });

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