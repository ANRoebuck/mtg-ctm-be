import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

import { PriceGetter_TrollTrader } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_TrollTrader();
});

describe('PriceGetter_TrollTrader', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Troll Trader');
  });

  it('gets results for Tarmogoyf', async () => {
    const searchTerm = 'Tarmogoyf';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.post.mockResolvedValueOnce({ data: { html: htmlString, queueWaitMs: 0, scrapeMs: 0 } });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5002/api/scrape',
      {
        targetUrl: 'https://www.trolltradercards.com/search?type=product&q=tarmogoyf&options%5Bprefix%5D=last&filter.v.availability=1',
        lazyElementSelector: '#filter-results',
      }
    );
    expect(results.length).toBe(11);
    expect(results).toStrictEqual(expectedResults);
  });

});


// Old test for the pre-Sept 2026 CrystalCommerce-platform site (mocked a plain axios.get),
// kept for reference — replaced above when Troll Trader migrated to Shopify.
//
// it('gets results for Tarmogoyf', async () => {
//   const searchTerm = 'Tarmogoyf';
//
//   const expectedResults = readResults(priceGetter.name, searchTerm);
//
//   const htmlString = readHtmlString(priceGetter.name, searchTerm);
//   mockedAxios.get.mockResolvedValueOnce({ data: htmlString });
//
//   const results: Price[] = await priceGetter.getPrices(searchTerm, false);
//
//   expect(mockedAxios.get).toHaveBeenCalledWith(
//     'https://www.trolltradercards.com/products/search?q=tarmogoyf',
//     { "headers": { "Origin": "compare-the-magic" } }
//   );
//   expect(results.length).toBe(8);
//   expect(results).toStrictEqual(expectedResults);
// });
