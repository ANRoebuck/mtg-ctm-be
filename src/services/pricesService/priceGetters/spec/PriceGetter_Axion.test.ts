import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

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

  it('gets results for Steam Vents', async () => {
    const searchTerm = 'Steam Vents';

    const expectedResults = readResults(priceGetter.name, searchTerm);
    // const expectedResults: Price[] = [];

    const htmlString1 = readHtmlString(priceGetter.name, searchTerm);
    const htmlString2 = readHtmlString(priceGetter.name, searchTerm, '_FOIL');

    mockedAxios.get
      .mockResolvedValueOnce({ data: htmlString1 })
      .mockResolvedValueOnce({ data: htmlString2 });

    const results: Price[] = await priceGetter.getPrices(searchTerm);

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(mockedAxios.get.mock.calls).toEqual([
      [
        stub + 'https://www.axionnow.com/search?type=product&q=steam+vents&filter.v.availability=1&filter.v.option.finish=Non-Foil',
        { "headers": { "Origin": "compare-the-magic" } }
      ],
      [
        stub + 'https://www.axionnow.com/search?type=product&q=steam+vents&filter.v.availability=1&filter.v.option.finish=Foil',
        { "headers": { "Origin": "compare-the-magic" } }
      ],
    ]);

    expect(results.length).toBe(7);
    // AggregatingPriceGetter cannot guarantee order, so compare results as sets
    expect(new Set(results)).toEqual(new Set(expectedResults));
  });

});

// NB: Axion's site attaches session IDs to product ref urls
// this makes capturing data for tests tricky but does not break app functionality