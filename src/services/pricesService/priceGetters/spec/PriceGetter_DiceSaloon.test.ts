import axios, { AxiosStatic } from 'axios';
import AbstractPriceGetter from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils';

import { PriceGetter_DiceSaloon } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: AbstractPriceGetter;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_DiceSaloon();
});

describe('PriceGetter_DiceSaloon', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Dice Saloon');
  });

  it('gets results for Tarmogoyf', async () => {
    const searchTerm = 'Tarmogoyf';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.search(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(stub + 'https://www.dicesaloonsingles.com/products?keywords=tarmogoyf&search%5Bin_stock%5D%5B%5D=true');
    expect(results.length).toBe(3);
    expect(results).toStrictEqual(expectedResults);
  });

});
