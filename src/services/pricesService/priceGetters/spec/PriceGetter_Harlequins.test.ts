import axios, { AxiosStatic } from 'axios';
import AbstractPriceGetter from '../abstract/AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from './test-resources/fsUtils';

import { PriceGetter_Harlequins } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: AbstractPriceGetter;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_Harlequins();
});

describe('PriceGetter_BigOrbitCards', () => {

  it('gets results for Tarmogoyf', async () => {
    const searchTerm = 'Tarmogoyf';

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    const expectedResults = readResults(priceGetter.name, searchTerm);

    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.search(searchTerm, false);

    expect(priceGetter.name).toBe('Harlequins');
    expect(mockedAxios.get).toHaveBeenCalledWith(stub + 'https://www.harlequins-games.com/products/search?q=tarmogoyf&c=8&disable_mobile=1');
    expect(results.length).toBe(4);
    expect(results).toStrictEqual(expectedResults);
  });

});
