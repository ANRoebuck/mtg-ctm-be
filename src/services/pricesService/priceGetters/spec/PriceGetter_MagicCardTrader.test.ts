import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

import { PriceGetter_MagicCardTrader } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_MagicCardTrader();
});

describe('PriceGetter_MagicCardTrader', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Magic Card Trader');
  });

  it('gets results for Restless Spire', async () => {
    const searchTerm = 'Restless Spire';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      stub + 'https://www.themagiccardtrader.com/products/search?q=restless+spire',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(2);
    expect(results).toStrictEqual(expectedResults);
  });

});
