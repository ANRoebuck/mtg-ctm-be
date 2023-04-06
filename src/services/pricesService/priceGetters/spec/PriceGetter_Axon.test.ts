import axios, { AxiosStatic } from 'axios';
import AbstractPriceGetter from '../abstract/AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from './test-resources/fsUtils';

import { PriceGetter_Axion } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';



beforeEach(() => {
  jest.clearAllMocks();
  // priceGetter = new PriceGetter_Axion();
});

describe('PriceGetter_Axion', () => {

  it('gets results for Tarmogoyf', async () => {
    const searchTerm = 'Tarmogoyf';

    let priceGetter: AbstractPriceGetter = new PriceGetter_Axion();

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    const expectedResults = readResults(priceGetter.name, searchTerm);

    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.search(searchTerm);
    
    // console.log(expectedResults)
    // console.log('//////////////')
    // console.log(results);

    expect(priceGetter.name).toBe('Axion Now');
    expect(mockedAxios.get).toHaveBeenCalledWith(stub + 'https://www.axionnow.com/products/search?q=tarmogoyf');
    expect(results.length).toBe(7);
    expect(results).toStrictEqual(expectedResults);
  });

});
