import { Price } from "../../../../types/Price";
import AggregatingPriceGetter from "../AggregatingPriceGetter";
import { IPriceGetterBehaviour } from "../AbstractPriceGetter";

import PriceGetter_Axion from '../PriceGetter_Axion';
import PriceGetter_BigOrbitCards from "../PriceGetter_BigOrbitCards";


const mockSearch1 = jest.fn();
const mockSearch2 = jest.fn();

jest.mock('../PriceGetter_Axion', () => {
    return jest.fn().mockImplementation(() => {
        return { getPrices: mockSearch1 }
    })
});

jest.mock('../PriceGetter_BigOrbitCards', () => {
    return jest.fn().mockImplementation(() => {
        return { getPrices: mockSearch2 }
    })
});


let mockPriceGetter1: IPriceGetterBehaviour;
let mockPriceGetter2: IPriceGetterBehaviour;
let mockPriceGetters: IPriceGetterBehaviour[];

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

        const prices = await (aggregatingPriceGetter.getPrices('some card'));

        expect(mockPriceGetter1.getPrices).toHaveBeenCalledWith('some card', false);
        expect(mockPriceGetter1.getPrices).toHaveBeenCalledTimes(1);

        expect(mockPriceGetter2.getPrices).toHaveBeenCalledWith('some card', false);
        expect(mockPriceGetter2.getPrices).toHaveBeenCalledTimes(1);

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