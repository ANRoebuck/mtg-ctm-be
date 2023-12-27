import axios, { AxiosStatic } from 'axios';
import AbstractPriceGetter from '../abstract/AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils';

import { PriceGetter_Hareruya } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: AbstractPriceGetter;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_Hareruya();
});

describe('PriceGetter_Hareruya', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Hareruya');
  });

  it('gets results for Tarmogoyf', async () => {
    const searchTerm = 'Tarmogoyf';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.search(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(stub + 'https://www.hareruyamtg.com/en/products/search?suggest_type=all&product=tarmogoyf');
    expect(results.length).toBe(15);
    expect(results).toStrictEqual(expectedResults);
  });

});
