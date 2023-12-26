import axios, { AxiosStatic } from 'axios';
import AbstractPriceGetter from '../abstract/AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from './test-resources/_fsUtils';

import { PriceGetter_BigOrbitCards } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: AbstractPriceGetter;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_BigOrbitCards();
});

describe('PriceGetter_BigOrbitCards', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Big Orbit Cards');
  });

  it('gets results for Seachrome Coast', async () => {
    const searchTerm = 'Seachrome Coast';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.search(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(stub + 'https://www.bigorbitcards.co.uk/shop-all-games/search/seachrome+coast/');
    expect(results.length).toBe(7);
    expect(results).toStrictEqual(expectedResults);
  });

});