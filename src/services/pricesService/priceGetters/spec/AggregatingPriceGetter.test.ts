import { Price } from "../../../../types/Price";
import AbstractPriceGetter from "../AbstractPriceGetter";
import AggregatingPriceGetter from "../AggregatingPriceGetter";

import PriceGetter_Axion from '../PriceGetter_Axion';
import PriceGetter_BigOrbitCards from "../PriceGetter_BigOrbitCards";


const mockSearch1 = jest.fn();
const mockSearch2 = jest.fn();

jest.mock('../PriceGetter_Axion', () => {
    return jest.fn().mockImplementation(() => {
        return { search: mockSearch1 }
    })
});

jest.mock('../PriceGetter_BigOrbitCards', () => {
    return jest.fn().mockImplementation(() => {
        return { search: mockSearch2 }
    })
});


let mockPriceGetter1: AbstractPriceGetter;
let mockPriceGetter2: AbstractPriceGetter;
let mockPriceGetters: AbstractPriceGetter[];

beforeEach(() => {
    mockSearch1.mockReset();
    mockSearch2.mockReset();

    mockPriceGetter1 = new PriceGetter_Axion();
    mockPriceGetter2 = new PriceGetter_BigOrbitCards();

    mockPriceGetters = [mockPriceGetter1, mockPriceGetter2];
});

describe('CachingPriceGetter', () => {
    it('Requests results from each PriceGetter', async () => {
        const aggregatingPriceGetter = new AggregatingPriceGetter({ name: 'someSeller', priceGetters: mockPriceGetters });
        
        mockSearch1.mockReturnValueOnce([priceA, priceB]);
        mockSearch2.mockReturnValueOnce([priceC]);

        const prices = await (aggregatingPriceGetter.search('some card'));

        expect(mockPriceGetter1.search).toHaveBeenCalledWith('some card');
        expect(mockPriceGetter1.search).toHaveBeenCalledTimes(1);

        expect(mockPriceGetter2.search).toHaveBeenCalledWith('some card');
        expect(mockPriceGetter2.search).toHaveBeenCalledTimes(1);

        expect(prices).toEqual([priceA, priceB, priceC]);
    });
});

const priceA: Price = {
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
};
const priceB: Price = {
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
};
const priceC: Price = {
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
};