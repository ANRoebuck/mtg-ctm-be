import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils';

import { PriceGetter_Axion } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_Axion();
});

describe('PriceGetter_Axion', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Axion Now');
  });

  it('gets results for Tarmogoyf', async () => {
    const searchTerm = 'Tarmogoyf';

    // const expectedResults = readResults(priceGetter.name, searchTerm);
    const expectedResults: Price[] = [];

    // const htmlString = readHtmlString(priceGetter.name, searchTerm);
    const htmlString1 = '';
    const htmlString2 = '';

    mockedAxios.get
      .mockResolvedValue({ data: htmlString1 })
      .mockResolvedValueOnce({ data: htmlString2 });

    const results: Price[] = await priceGetter.getPrices(searchTerm);

    // expect(mockedAxios.get).toHaveBeenCalledTimes(2);

    // expect(mockedAxios.get).toHaveBeenCalledWith(
    //   stub + 'https://www.axionnow.com/search?type=product&q=tarmogoyf&filter.v.availability=1&filter.v.option.finish=Non-Foil',
    //   { "headers": { "Origin": "compare-the-magic" } });
    // expect(mockedAxios.get).toHaveBeenCalledWith(
    //   stub + 'https://www.axionnow.com/search?type=product&q=tarmogoyf&filter.v.availability=1&filter.v.option.finish=Foil',
    //   { "headers": { "Origin": "compare-the-magic" } });

    // expect(mockedAxios.get.mock.calls).toEqual([
    //   [
    //     stub + 'https://www.axionnow.com/search?type=product&q=tarmogoyf&filter.v.availability=1&filter.v.option.finish=Non-Foil',
    //     { "headers": { "Origin": "compare-the-magic" } }
    //   ],
    //   [
    //     stub + 'https://www.axionnow.com/search?type=product&q=tarmogoyf&filter.v.availability=1&filter.v.option.finish=Foil',
    //     { "headers": { "Origin": "compare-the-magic" } }
    //   ],
    // ]);

    expect(results.length).toBe(0);
    expect(results).toStrictEqual(expectedResults);
  });

});
